const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const assetId = getRouterParam(event, 'assetId');
    const query = getQuery(event);
    const session = event.context.session;

    if (query.forVerifiedBuyers) {
        return await $fetch(
            `${cloudUrl}/srv/intention-analytics/api/questionnaire/${assetId}/active-questionnaire/verified-buyers`,
            {
                headers: {
                    Authorization: `Bearer ${session?.token}`,
                },
            },
        );
    } else {
        return await $fetch(
            `${cloudUrl}/srv/intention-analytics/api/questionnaire/${assetId}/active-questionnaire/general-users`,
            {
                headers: {
                    Authorization: `Bearer ${session?.token}`,
                },
            },
        );
    }
});
