import { getToken } from '#auth';

const { baseDevelopUrl, catalogName } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const catalogResults: string[] = await $fetch(`${baseDevelopUrl}/search/datasets?catalogue=${catalogName}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    //TODO: Currently having to make multiple calls to each ID since there is not a simpler way to get direct results

    const results: Record<string, any>[] = [];

    if (!catalogResults.length) {
        return results;
    }

    for (const catalogResult of catalogResults) {
        const assetResult: Record<string, any> = await $fetch(`${baseDevelopUrl}/search/datasets/${catalogResult}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        });

        results.push(assetResult.result as Record<string, any>);
    }

    return results;
});
