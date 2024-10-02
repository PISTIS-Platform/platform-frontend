import { getToken } from '#auth';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const data: Array<{ name: unknown }> = await $fetch(config.public.apiBase + '/ape/groups', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
    const r = [];
    for (const item of data) {
        r.push(item.name);
    }

    return r;
});
