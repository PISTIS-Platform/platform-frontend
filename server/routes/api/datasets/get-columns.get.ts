const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const query = getQuery(event);

    return await $fetch(`${factoryUrl}/srv/data-enrichment-backend/get_asset`, {
        method: 'GET',
        params: {
            dataset_id: query.datasetId,
            distribution_id: query.distributionId,
            file_type: 'sql',
        },
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
