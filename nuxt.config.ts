// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false, // Disable server-side rendering
    telemetry: false, // Disable telemetry by Nuxt team
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
        authSecret: '',
        keycloakClientId: '',
        keycloakClientSecret: '',
        keycloakIssuer: '',

        public: {
            appUrl: '',
        },
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
    components: [
        {
            path: '~/components',
            pathPrefix: false,
        },
    ],
});
