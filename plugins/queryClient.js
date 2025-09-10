import { piveauKitPlugin } from '@piveau/sdk-vue';
import { de } from '@piveau/sdk-vue/locale';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

export default defineNuxtPlugin((nuxtApp) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 0,
            },
        },
    });

    nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });
    nuxtApp.vueApp.use(piveauKitPlugin, {
        queryClient: queryClient,
        locale: {
            messages: {
                de: {
                    ...de,
                    metadata: {
                        ...de.metadata,
                        modificationDate: 'Aktualisiert',
                    },
                },
            },
            locale: 'en',
            fallbackLocale: 'en',
            dateFormatStrings: {
                short: 'DD.MM.YYYY',
                medium: 'DD.MM.YYYY',
                long: 'DD. MMMM YYYY hh:mm:ss',
            },
        },
    });
});
