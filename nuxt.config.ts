// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    // Disable server-side rendering
    ssr: false,

    // Disable telemetry by Nuxt team
    telemetry: false,

    components: [
        {
            path: '~/components',
            pathPrefix: false,
        },
    ],

    alias: {
        cookie: 'cookie',
    },

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
        experimental: {
            websocket: true,
        },
    },

    app: {
        head: {
            link: [{ rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' }],
        },
    },

    runtimeConfig: {
        public: {
            iamUrl: process.env.NUXT_PUBLIC_IAM_URL,
            orgId: process.env.NUXT_PUBLIC_ORG_ID, //NUXT_PUBLIC_ORG_ID
            orgLogo: process.env.NUXT_PUBLIC_ORG_LOGO,
            catalogUrl: process.env.NUXT_PUBLIC_CATALOG_URL,
            marketplaceUrl: process.env.NUXT_PUBLIC_MARKETPLACE_URL,
        },
        authSecret: process.env.NUXT_NEXTAUTH_SECRET,
        keycloak: {
            issuer: process.env.NUXT_KEYCLOAK_ISSUER,
            clientId: process.env.NUXT_KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.NUXT_KEYCLOAK_CLIENT_SECRET,
        },

        marketInsightsUrl: process.env.NUXT_MARKET_INSIGHTS_URL,
        anonymizerApiUrl: process.env.ANONYMIZER_URL,
        intentionAnalyticsServerUrl: process.env.NUXT_INTENTION_ANALYTICS_SERVER_URL,
        sctcUrl: process.env.NUXT_SCTC_URL,
        notificationsUrl: process.env.NUXT_NOTIFICATIONS_URL,
        assetsUrl: process.env.NUXT_ASSETS_URL,
        walletUrl: process.env.NUXT_WALLET_URL,
        walletAlias: process.env.NUXT_WALLET_ALIAS,
    },

    modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@sidebase/nuxt-auth', '@vueuse/nuxt', '@nuxt/ui'],

    // Modules Configuration
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
    },

    auth: {
        baseURL: '/_auth',
        provider: {
            type: 'authjs',
            defaultProvider: 'keycloak',
        },
        session: {
            enableRefreshPeriodically: false,
            enableRefreshOnWindowFocus: true,
        },
        globalAppMiddleware: {
            isEnabled: true,
        },
    },

    colorMode: {
        preference: 'light',
    },

    compatibilityDate: '2024-08-28',
});
