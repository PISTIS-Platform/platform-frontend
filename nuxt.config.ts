// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false, // Disable server-side rendering
    telemetry: false, // Disable telemetry by Nuxt team
    components: [
        {
            path: '~/components',
            pathPrefix: false,
        },
    ],
    plugins: ['~/plugins/vue3-tags.js', '~/plugins/vue3-chartjs'],
    devtools: { enabled: true },
    ui: {
        icons: ['heroicons', 'fa6-regular', 'formkit'],
    },
    typescript: {
        strict: true,
        typeCheck: false, // Enabling this makes development slower, but performs proper type checking
    },

    nitro: {
        preset: 'node-server',
    },

    app: {
        head: {
            link: [{ rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' }],
        },
    },

    runtimeConfig: {
        authSecret: process.env.NUXT_NEXTAUTH_SECRET,
        keycloakClientId: process.env.NUXT_KEYCLOAK_CLIENT_ID,
        keycloakClientSecret: process.env.NUXT_KEYCLOAK_CLIENT_SECRET,
        keycloakIssuer: process.env.NUXT_KEYCLOAK_ISSUER,

        marketInsightsUrl: process.env.NUXT_MARKET_INSIGHTS_URL,

        // public: {
        //     appUrl: '',
        // },
    },

    modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@sidebase/nuxt-auth', '@vueuse/nuxt', '@nuxt/ui'],
    // Modules Configuration
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
    },

    auth: {
        isEnabled: true,
        baseURL: '/_auth',
        provider: {
            type: 'authjs',
            defaultProvider: 'keycloak',
            addDefaultCallbackUrl: true,
        },
        globalAppMiddleware: {
            isEnabled: false, // Note: Keep disabled until Keycloak is in-place
            allow404WithoutAuth: true,
        },
    },
    colorMode: {
        preference: 'light',
    },
});
