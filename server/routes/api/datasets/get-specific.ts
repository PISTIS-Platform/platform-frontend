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

    const id = query.id;
    console.log(id);

    // const asset = result.result.results.find((item) => item.id === assetId);
    // console.log(asset);
    // return asset;

    return result;
});
