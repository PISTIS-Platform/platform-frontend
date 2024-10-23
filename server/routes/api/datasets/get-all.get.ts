import { getToken } from '#auth';

const { assetsUrl, catalogAssetsUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const catalogResults: string[] = await $fetch(catalogAssetsUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    //TODO: Currently having to make multiple calls to each ID since there is not a simpler way to get direct results

    const results = [];

    for (const catalogResult of catalogResults) {
        const assetResult: Record<string, any> = await $fetch(`${assetsUrl}/datasets/${catalogResult}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        });

        results.push(assetResult.result as Record<string, any>);
    }

    return results;
});
