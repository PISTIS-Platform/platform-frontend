// server/api/auth/[...].ts  (your current NuxtAuthHandler file)
import jwtDecode from 'jwt-decode';
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
        id_token?: string;
    }
}

const { authSecret, keycloak } = useRuntimeConfig();

const getUserOrgId = (profile: any) => profile.pistis?.group?.id || '';

export const authOptions = {
    secret: authSecret,
    providers: [
        // .default for SSR if needed
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
                token.id_token = account.id_token;
                token.provider = account.provider ?? 'keycloak';
                try {
                    const decoded: any = jwtDecode(account.access_token);
                    token.orgId = getUserOrgId(decoded);
                } catch (e) {
                    // ignore decode errors
                }
            }
            return token;
        },
        session: async ({ session, token }: any) => {
            session.orgId = token.orgId;
            session.token = token.access_token;
            session.id_token = token.id_token;
            return session;
        },
    },
    events: {
        async signOut({ _token }: any) {},
    },
};

export default NuxtAuthHandler(authOptions);
