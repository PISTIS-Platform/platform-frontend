const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;

    const data: Array<{ name: unknown }> = await $fetch(
        config.public.cloudUrl + '/srv/identity-access-management/api/v1/ape/groups',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        },
    );

    return data.map(({ name }) => name);
});
