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
    }
}

declare module 'next-auth' {
    interface Session {
        roles?: string[];
    }
}

const { authSecret, keycloak } = useRuntimeConfig();

const PistisRoles = ['PISTIS_ADMIN'];

const getPistisRoles = (profile: any) => {
    return profile.realm_access.roles.filter((role: string) => PistisRoles.includes(role)) || [];
};

async function refreshAccessToken(token: JWT) {
    try {
        if (!token.refresh_token) return token;

        const { access_token, expires_in, id_token } = await $fetch<{
            access_token: string;
            expires_in: number;
            id_token: string;
        }>(`${keycloak.issuer}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: keycloak.clientId,
                client_secret: keycloak.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: token.refresh_token,
            }),
        });

        return {
            ...token,
            access_token,
            id_token,
            expires_at: Date.now() + (expires_in - 15) * 1000,
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
                token.id_token = account.id_token;
                token.provider = account.provider;
                token.access_token = account.access_token;
                token.refresh_token = account.refresh_token;
                token.roles = getPistisRoles(jwtDecode(account.access_token));
                if (account.expires_at) {
                    token.expires_at = (account.expires_at - 15) * 1000;
                }
                return Promise.resolve(token);
            }

            if (token.expires_at && Date.now() > token.expires_at) {
                return await refreshAccessToken(token);
            }

            return Promise.resolve(token);
        },
        session: async ({ session, token }: any) => {
            // If token contains error, return clear session to force the browser to go through the authentication process again
            if (token?.error === 'RefreshAccessTokenError') return Promise.resolve(null);

            session.roles = token.roles;
            session.user = {
                ...session.user,
                ...token,
            };

            return Promise.resolve(session);
        },
    },
    events: {
        async signOut({ token }: any) {
            if (token.provider === 'keycloak') {
                const logOutUrl = new URL(`${keycloak.issuer}/protocol/openid-connect/logout`);
                logOutUrl.searchParams.append('id_token_hint', token.id_token!);
                await fetch(logOutUrl);
            }
        },
    },
};

export default NuxtAuthHandler(authOptions);
