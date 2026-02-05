const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = await getQuery(event);

    const result: Record<string, any> = await $fetch(`${cloudUrl}/srv/search/datasets/${query.id}`, {
        method: 'GET',
    });

    return result.result;
});
