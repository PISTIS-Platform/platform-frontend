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
                token.id_token = account.id_token;
            }

            return Promise.resolve(token);
        },
        session: async ({ session, token }: any) => {
            session.orgId = token.orgId;
            session.token = token.access_token;
            session.id_token = token.id_token;
            return Promise.resolve(session);
        },
    },
};

export default NuxtAuthHandler(authOptions);
