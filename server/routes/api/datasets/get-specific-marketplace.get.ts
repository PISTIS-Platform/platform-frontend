const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = await getQuery(event);
    const session = event.context.session;

    const result: Record<string, any> = await $fetch(`${cloudUrl}/srv/search/datasets/${query.id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });

    return result.result;
});
