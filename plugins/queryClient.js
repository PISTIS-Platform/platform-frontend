import { piveauKitPlugin } from '@piveau/sdk-vue';
import { de } from '@piveau/sdk-vue/locale';
import { MutationCache, QueryCache, QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

export default defineNuxtPlugin((nuxtApp) => {
    const { signOut } = useAuth();

    const handle401 = (error) => {
        const status = error?.statusCode ?? error?.response?.status ?? error?.data?.statusCode;
        if (status === 401) {
            signOut({ callbackUrl: '/' });
        }
    };

    const queryClient = new QueryClient({
        queryCache: new QueryCache({ onError: handle401 }),
        mutationCache: new MutationCache({ onError: handle401 }),
        defaultOptions: {
            queries: {
                staleTime: 0,
                retry: (failureCount, error) => {
                    const status = error?.statusCode ?? error?.response?.status;
                    if (status === 401) return false;
                    return failureCount < 3;
                },
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
