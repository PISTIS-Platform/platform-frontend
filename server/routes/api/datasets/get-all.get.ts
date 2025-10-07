const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (_event) => {
    const catalogResults: string[] = await $fetch(`${factoryUrl}/srv/search/datasets?catalogue=my-data`, {
        method: 'GET',
    });

    //TODO: Currently having to make multiple calls to each ID since there is not a simpler way to get direct results

    const results: Record<string, any>[] = [];

    if (!catalogResults.length) {
        return results;
    }

    for (const catalogResult of catalogResults) {
        const assetResult: Record<string, any> = await $fetch(`${factoryUrl}/srv/search/datasets/${catalogResult}`, {
            method: 'GET',
        });

        results.push(assetResult.result as Record<string, any>);
    }

    return results;
});
