import { jwtDecode } from 'jwt-decode';
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
                token.access_token = account.access_token;
                const decodedJWT = jwtDecode(account.access_token);
                token.orgId = getUserOrgId(decodedJWT);
                token.provider = account.provider;
                token.id_token = account.id_token;
                token.sub = getUserSub(jwtDecode(account.access_token));
            }

            return Promise.resolve(token);
        },
        session: async ({ session, token }: any) => {
            session.orgId = token.orgId;
            session.token = token.access_token;
            session.sub = token.sub;
            return Promise.resolve(session);
        },
    },
    events: {
        async signOut({ token }: any) {
            if (token.provider === 'keycloak') {
                const logOutUrl = new URL(`${keycloak.issuer}/protocol/openid-connect/logout`);
                logOutUrl.searchParams.append('id_token_hint', token.id_token);
                await fetch(logOutUrl);
            }
        },
    },
};

export default NuxtAuthHandler(authOptions);
