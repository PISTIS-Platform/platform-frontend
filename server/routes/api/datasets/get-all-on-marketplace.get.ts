const {
    public: { cloudUrl },
    organisationFullname,
    pistisMarketplaceCatalog,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = await getQuery(event);

    const facets = {
        monetizationType: ['one-off', 'subscription'],
        publisher: [organisationFullname],
        is_free: query?.nonFree ? [false] : [],
        catalog: [pistisMarketplaceCatalog],
    };

    let page = 0;
    let innerResult: any;
    let outerResults: Record<string, any>[] = [];

    do {
        innerResult = await $fetch<Record<string, any>>(
            `${cloudUrl}/srv/search/search?page=${page}&limit=1000&filters=dataset&includes=id,title,description,distributions,modified&facets=${encodeURIComponent(JSON.stringify(facets))}`,
            {
                method: 'GET',
            },
        );
        page++;
        innerResult = innerResult?.result?.results;
        outerResults = outerResults.concat(innerResult);
    } while (innerResult?.length);

    return outerResults;
});
