import KeycloakProvider from 'next-auth/providers/keycloak';

import { NuxtAuthHandler } from '#auth';

declare module 'next-auth/jwt' {
    interface JWT {
        id_token?: string;
        provider?: string;
    }
}

const {
    authSecret,
    keycloakClientId: clientId,
    keycloakClientSecret: clientSecret,
    keycloakIssuer: issuer,
} = useRuntimeConfig();

export default NuxtAuthHandler({
    secret: authSecret,
    providers: [
        // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
        KeycloakProvider.default({ clientId, clientSecret, issuer }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.id_token = account.id_token;
                token.provider = account.provider;

                // TODO: Send token to /api/keycloak-login
            }

            return token;
        },
    },
    events: {
        async signOut({ token }) {
            if (token.provider === 'keycloak') {
                const logOutUrl = new URL(`${issuer}/protocol/openid-connect/logout`);
                logOutUrl.searchParams.append('id_token_hint', token.id_token!);
                await fetch(logOutUrl);
            }
        },
    },
});
