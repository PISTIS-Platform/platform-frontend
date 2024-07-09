export default defineNuxtRouteMiddleware(async (_to) => {
    const { data: session, signOut } = useAuth();
    const runtimeConfig = useRuntimeConfig();

    if (session.value && session.value?.orgId !== runtimeConfig.public.orgId) {
        // await navigateTo('https://pistis-market.eu/', {
        //     external: true,
        // });
        signOut();
    }
});
