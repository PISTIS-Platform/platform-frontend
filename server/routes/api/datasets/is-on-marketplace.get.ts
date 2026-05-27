const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const session = event.context.session;

    const result: Record<string, any> = await $fetch(
        `${cloudUrl}/srv/search/search?q=${query.id}&filters=dataset&fields=offer.original_id.raw&includes=id,offer,monetization`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        },
    );

    return {
        isPublished: result.result.results.length > 0,
        results: result.result.results,
    };
});
