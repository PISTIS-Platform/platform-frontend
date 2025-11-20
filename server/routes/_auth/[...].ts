/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from 'jwt-decode';
import KeycloakProvider from 'next-auth/providers/keycloak';

import { NuxtAuthHandler } from '#auth';

import { getTokens, removeTokens, setTokens } from '../../utils/tokenStorage';

declare module 'next-auth/jwt' {
    interface JWT {
        id_token?: string;
        provider?: string;
        sessionId?: string;
        orgId?: string;
        sub?: string;
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

const getUserOrgId = (profile: any) => {
    return profile.pistis?.group?.id || '';
};

const getUserSub = (profile: any) => {
    return profile.sub || '';
};

async function refreshAccessToken(sessionId: string, refreshToken: string) {
    try {
        const response = await $fetch<{
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
                refresh_token: refreshToken,
            }),
        });

        const { access_token, expires_in, id_token, refresh_token: new_refresh_token } = response;

        // Get expiration from JWT if expires_in not provided
        let expiresAt: number;

        if (expires_in) {
            expiresAt = Date.now() + (expires_in - 15) * 1000;
        } else {
            const decodedToken: any = jwtDecode(access_token);
            expiresAt = (decodedToken.exp - 15) * 1000;
        }

        // Update stored tokens with refreshed values
        await setTokens(sessionId, {
            access_token,
            id_token,
            refresh_token: new_refresh_token,
            expires_at: expiresAt,
        });

        return { access_token, id_token, refresh_token: new_refresh_token, expires_at: expiresAt };
    } catch (err: any) {
        console.error('[Auth] Token refresh failed:', err?.message || err);
        return null;
    }
}

export const authOptions = {
    secret: authSecret,
    session: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
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
            // Initial login - store tokens server-side
            if (account && user) {
                const decodedJWT: any = jwtDecode(account.access_token);

                // Create unique sessionId for this login (supports multiple concurrent sessions)
                const sessionId = `${user.id || decodedJWT.sub}-${Date.now()}`;

                // Get expiration from JWT token (exp is in seconds since epoch)
                // Keycloak may not provide expires_in, so we decode it from the token itself
                const tokenExpSeconds = decodedJWT.exp;
                const expiresAt = (tokenExpSeconds - 15) * 1000; // Convert to ms and subtract 15s buffer

                // Store tokens server-side (Redis or filesystem based on STORAGE_DRIVER)
                await setTokens(sessionId, {
                    access_token: account.access_token,
                    id_token: account.id_token,
                    refresh_token: account.refresh_token,
                    expires_at: expiresAt,
                });

                // Store only minimal data in JWT cookie
                token.sessionId = sessionId;
                token.orgId = getUserOrgId(decodedJWT);
                token.provider = account.provider;
                token.sub = getUserSub(decodedJWT);
            }

            return Promise.resolve(token);
        },
        session: async ({ session, token }: any) => {
            session.orgId = token.orgId;
            session.sub = token.sub;

            // Retrieve tokens from server-side storage
            if (!token.sessionId) {
                session.token = null;
                return session;
            }

            const storedTokens = await getTokens(token.sessionId);

            if (!storedTokens) {
                session.token = null;
                return session;
            }

            // Check if token needs refresh
            if (Date.now() > storedTokens.expires_at) {
                const refreshed = await refreshAccessToken(token.sessionId, storedTokens.refresh_token);
                session.token = refreshed ? refreshed.access_token : null;
            } else {
                session.token = storedTokens.access_token;
            }

            return Promise.resolve(session);
        },
    },
    events: {
        async signOut({ token }: any) {
            // Get id_token BEFORE removing from storage
            let idToken: string | null = null;
            if (token.sessionId && token.provider === 'keycloak') {
                const storedTokens = await getTokens(token.sessionId);
                idToken = storedTokens?.id_token || null;
            }

            // Clean up stored tokens for this session
            if (token.sessionId) {
                await removeTokens(token.sessionId);
            }

            // Logout from Keycloak
            if (idToken) {
                const logOutUrl = new URL(`${keycloak.issuer}/protocol/openid-connect/logout`);
                logOutUrl.searchParams.append('id_token_hint', idToken);
                await fetch(logOutUrl);
            }
        },
    },
};

export default NuxtAuthHandler(authOptions);
