const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const query = getQuery(event);

    return await $fetch(`${factoryUrl}/srv/factory-data-storage/api/tables/get_rows`, {
        method: 'GET',
        params: {
            asset_uuid: query.assetUuid,
            column_name: query.columnName,
            column_datatype: query.columnDatatype,
            start_date: query.startDate,
            end_date: query.endDate,
        },
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
