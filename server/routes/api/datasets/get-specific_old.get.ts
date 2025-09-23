import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getQuery(event);

    const result: Record<string, any> = await $fetch(`${factoryUrl}/srv/search/datasets/${query.id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    return result.result;
});
