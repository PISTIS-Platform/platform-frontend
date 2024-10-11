import { getToken } from '#auth';

const { assetsUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getQuery(event);

    const result = await $fetch(`${assetsUrl}/datasets/${query.id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    return result.result;
});
