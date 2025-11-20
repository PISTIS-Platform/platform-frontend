const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;

    return $fetch(config.public.cloudUrl + '/srv/identity-access-management/api/v1/ape/attributes/countries', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
