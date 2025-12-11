const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const session = event.context.session;

    return $fetch(
        `${cloudUrl}/srv/intention-analytics/api/questionnaire/${query.assetId}/answers/${query.forVerifiedBuyers}`,
        {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        },
    );
});
