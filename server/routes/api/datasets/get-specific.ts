import { getToken } from '#auth';

const { assetsUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getQuery(event);

    const result = await $fetch(assetsUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    const assetId = query.id;

    const asset = result.result.results.find((item) => item.id === assetId);
    return asset;
});
