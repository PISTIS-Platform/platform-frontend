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

    plugins: [
        '~/plugins/vue3-tags.js',
        '~/plugins/vue3-chartjs.js',
        '~/plugins/queryClient.js',
        '~/plugins/primevue.js',
    ],
    devtools: { enabled: true },

    ui: {
        icons: ['heroicons', 'fa6-regular', 'formkit'],
    },

    css: ['primevue/resources/primevue.min.css', 'primevue/resources/themes/saga-blue/theme.css'],

    typescript: {
        strict: true,
        typeCheck: false, // Enabling this makes development slower, but performs proper type checking
    },

    nitro: {
        preset: 'node-server',
        experimental: {
            websocket: true,
        },
        storage: {
            'auth-tokens': {
                driver: process.env.STORAGE_DRIVER || 'fs',
                base: './.data/auth-tokens',
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || '6379',
                password: process.env.REDIS_PASSWORD,
                db: process.env.REDIS_DB || '0',
                ttl: process.env.REDIS_TTL || 2592000, // 30 days default
            },
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
            catalogName: '',
        },
        keycloak: {
            issuer: '',
            clientId: '',
            clientSecret: '',
        },
        prometheusUrl: '',
        authSecret: '',
        catalogName: '',
        walletAlias: '',
        factoryName: '',
        organisationFullname: '',
        pistisMode: '',
        pistisMarketplaceCatalog: '',
        piveauHubRepoXApiKey: '',
    },

    modules: [
        '@pinia/nuxt',
        '@nuxtjs/i18n',
        '@sidebase/nuxt-auth',
        '@vueuse/nuxt',
        '@nuxt/ui',
        '@nuxt/icon',
        'unplugin-icons/nuxt',
    ],

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
            enableRefreshPeriodically: 60000,
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
