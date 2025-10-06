const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const result: Record<string, any> = await $fetch(
        `${cloudUrl}/srv/search/search?q=${query.id}&filters=dataset&fields=offer.original_id&includes=id,offer,monetization`,
        {
            method: 'GET',
        },
    );

    return !!result.result.results.length;
});
