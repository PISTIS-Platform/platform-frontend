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
            // maxAge: 30 * 24 * 60 * 60, // default to 30 days
            maxAge: 120,
            updateAge: 60, // refresh every 60 seconds
        },
        globalAppMiddleware: {
            isEnabled: false,
        },
    },

    colorMode: {
        preference: 'light',
    },

    compatibilityDate: '2024-08-28',
});
