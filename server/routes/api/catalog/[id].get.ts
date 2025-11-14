const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const id = getRouterParam(event, 'id');

    const response = await $fetch(`${cloudUrl}/srv/repo/datasets/${id}`, {
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });

    return response['@graph'];
});
