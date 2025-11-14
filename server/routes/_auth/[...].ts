import { jwtDecode } from 'jwt-decode';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

import { NuxtAuthHandler } from '#auth';

declare module 'next-auth/jwt' {
    interface JWT {
        id_token?: string;
        provider?: string;
        refresh_token?: string;
        access_token?: string;
        expires_at?: number;
        sessionId?: string; // Server-side session identifier
    }
}

declare module 'next-auth' {
    interface Session {
        roles?: string[];
        orgId?: string;
        token: string;
    }
}

const { authSecret, keycloak } = useRuntimeConfig();

// Server-side token storage
interface TokenStorage {
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_at: number;
}

const tokenStorage = useStorage<TokenStorage>('auth-tokens');

const getUserOrgId = (profile: any) => {
    return profile.pistis?.group?.id || '';
};

const getUserSub = (profile: any) => {
    return profile.sub || '';
};

async function refreshAccessToken(token: JWT) {
    try {
        if (!token.sessionId) return token;

        // Retrieve tokens from server-side storage
        const storedTokens = await tokenStorage.getItem(token.sessionId);
        if (!storedTokens?.refresh_token) return token;

        const { access_token, expires_in, id_token, refresh_token } = await $fetch<{
            access_token: string;
            expires_in: number;
            id_token: string;
            refresh_token: string;
        }>(`${keycloak.issuer}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: keycloak.clientId,
                client_secret: keycloak.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: storedTokens.refresh_token,
            }),
        });

        const newExpiresAt = Date.now() + (expires_in - 15) * 1000;

        // Update server-side storage with new tokens
        await tokenStorage.setItem(token.sessionId, {
            access_token,
            id_token,
            refresh_token,
            expires_at: newExpiresAt,
        });

        return {
            ...token,
            expires_at: newExpiresAt,
        };
    } catch (err) {
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

export const authOptions = {
    secret: authSecret,
    session: {
        maxAge: 24 * 60 * 60, // 1 day, as in jwt
    },
    providers: [
        // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some poin
        KeycloakProvider.default({
            issuer: keycloak.issuer,
            clientId: keycloak.clientId,
            clientSecret: keycloak.clientSecret,
        }),
    ],
    callbacks: {
        jwt: async ({ token, account, user }: any) => {
            if (account && user) {
                const decodedJWT = jwtDecode(account.access_token);

                // Generate unique session ID
                const sessionId = `${user.id || decodedJWT.sub}-${Date.now()}`;

                // Store tokens server-side (NOT in cookie)
                await tokenStorage.setItem(sessionId, {
                    access_token: account.access_token,
                    id_token: account.id_token,
                    refresh_token: account.refresh_token,
                    expires_at: Date.now() + (account.expires_in - 15) * 1000,
                });

                // Only store minimal data in JWT cookie
                token.sessionId = sessionId;
                token.orgId = getUserOrgId(decodedJWT);
                token.provider = account.provider;
                token.sub = getUserSub(decodedJWT);
                token.expires_at = Date.now() + (account.expires_in - 15) * 1000;
            }

            if (token.expires_at && Date.now() > token.expires_at) {
                return await refreshAccessToken(token);
            }

            return Promise.resolve(token);
        },
        session: async ({ session, token }: any) => {
            session.orgId = token.orgId;
            session.sub = token.sub;

            // Retrieve access_token from server-side storage
            if (token.sessionId) {
                const storedTokens = await tokenStorage.getItem(token.sessionId);
                session.token = storedTokens?.access_token || '';
            }

            return Promise.resolve(session);
        },
    },
    events: {
        async signOut({ token }: any) {
            if (token.provider === 'keycloak' && token.sessionId) {
                // Retrieve id_token from server-side storage
                const storedTokens = await tokenStorage.getItem(token.sessionId);

                if (storedTokens?.id_token) {
                    const logOutUrl = new URL(`${keycloak.issuer}/protocol/openid-connect/logout`);
                    logOutUrl.searchParams.append('id_token_hint', storedTokens.id_token);
                    await fetch(logOutUrl);
                }

                // Clean up server-side storage
                await tokenStorage.removeItem(token.sessionId);
            }
        },
    },
};

export default NuxtAuthHandler(authOptions);
