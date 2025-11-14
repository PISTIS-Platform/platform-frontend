const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const query = getQuery(event);

    const response = await $fetch(
        `${cloudUrl}/srv/investment-planner/api/investment-planner/retrieve/${query.cloudAssetId}`,
        {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        },
    );

    return response;
});
