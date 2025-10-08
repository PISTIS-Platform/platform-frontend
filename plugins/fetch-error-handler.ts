export default defineNuxtPlugin(async (_nuxtApp) => {
    const { signOut } = useAuth();

    globalThis.$fetch = $fetch.create({
        async onResponseError({ response, error }) {
            // ⚠️ IMPORTANT: Only handle 401 errors
            if (response.status === 401) {
                // log the event to console
                console.error('API request failed with 401. Forcing client-side logout and redirect.');

                // force a client-side logout
                await signOut({
                    callbackUrl: '/',
                    redirect: true,
                });

                // throw the error to stop the original $fetch call
                // from trying to process data in the main application logic
                throw error;
            }
        },
    });
});
