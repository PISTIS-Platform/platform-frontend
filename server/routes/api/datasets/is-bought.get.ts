const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const result = await $fetch(
        `${factoryUrl}/srv/search/search?q=${query.id}&filters=dataset&facets={"catalog":["acquired-data"]}&fields=offer.marketplace_offer_id.raw&includes=id,offer`,
        {
            method: 'GET',
        },
    );

    return {
        isBought: result.result.results.length > 0,
        results: result.result.results,
    };
});
