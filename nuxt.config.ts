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
            factoryUrl: '',
            cloudUrl: '',
            orgId: '',
            orgLogo: '',
            kafkaBrokers: '',
            kafkaSecurityProtocol: '',
            kafkaSaslMechanism: '',
        },
        keycloak: {
            issuer: '',
            clientId: '',
            clientSecret: '',
        },

        authSecret: '',
        catalogName: '',
        walletAlias: '',
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
