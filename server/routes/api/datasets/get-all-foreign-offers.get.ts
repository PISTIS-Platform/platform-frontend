const {
    public: { cloudUrl, pistisMarketplaceCatalog },
    organisationFullname,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = await getQuery(event);

    const facets = {
        monetizationType: ['one-off', 'subscription'],
        is_free: query?.nonFree ? [false] : [],
        catalog: [pistisMarketplaceCatalog],
    };

    let page = 0;
    let innerResult: any;
    let outerResults: Record<string, any>[] = [];

    do {
        innerResult = await $fetch<Record<string, any>>(
            `${cloudUrl}/srv/search/search?page=${page}&limit=1000&filters=dataset&includes=id,title,description,distributions,modified,publisher&facets=${encodeURIComponent(JSON.stringify(facets))}`,
            {
                method: 'GET',
            },
        );
        page++;
        innerResult = innerResult?.result?.results;
        outerResults = outerResults.concat(innerResult);
    } while (innerResult?.length);

    return outerResults.filter(
        (item) =>
            item.publisher?.name !== organisationFullname &&
            !item.distributions?.some((dist: any) =>
                dist.access_url?.some((url: string) => url.includes('provider/kafka')),
            ),
    );
});
