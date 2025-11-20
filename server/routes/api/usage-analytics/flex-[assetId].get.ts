const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const assetId = getRouterParam(event, 'assetId');
    const session = event.context.session;

    return await $fetch(`${cloudUrl}/srv/intention-analytics/api/questionnaire/${assetId}/active-questionnaire`, {
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
