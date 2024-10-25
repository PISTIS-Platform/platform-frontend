import { getToken } from '#auth';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const data: Array<{ name: unknown }> = await $fetch(
        config.public.cloudUrl + '/srv/identity-access-management/api/v1/ape/groups',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        },
    );

    return data.map(({ name }) => name);
});
