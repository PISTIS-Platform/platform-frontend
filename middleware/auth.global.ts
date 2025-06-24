export default defineNuxtRouteMiddleware(async (to) => {
    const { data: session, signOut, status } = useAuth();
    const runtimeConfig = useRuntimeConfig();

    if (session.value && session.value?.orgId !== runtimeConfig.public.orgId) {
        signOut({ callbackUrl: '/' });
    }

    if (to.path !== '/' && (!session.value || status.value !== 'authenticated')) {
        signOut({ callbackUrl: '/' });
    }
});
