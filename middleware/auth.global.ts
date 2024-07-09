export default defineNuxtRouteMiddleware(async (to) => {
    const { data: session } = useAuth();
    const { orgId } = useRuntimeConfig();

    console.log(orgId, to, session);
    //TODO: Get organisationId from user session and compare it to factory organisation id
    //TODO: if not the same, log out or redirect out of the site

    // if (['factory-registration'].includes(to.name as string)) {
    //     return; // here this middleware will not execute anything with specific routes in the array.
    // }

    // if (session.value && !session.value.roles?.includes('PISTIS_ADMIN')) {
    //     return navigateTo('/factory-registration');
    // }
});
