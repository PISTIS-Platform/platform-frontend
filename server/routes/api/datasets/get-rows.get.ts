const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const query = getQuery(event);

    const toYMD = (d: string) => new Date(d).toISOString().slice(0, 10);
    const today = toYMD(new Date().toISOString());

    const params = {
        asset_uuid: query.assetUuid,
        column_name: query.columnName,
        column_datatype: query.columnDatatype,
        start_date: query.startDate ? toYMD(query.startDate as string) : today,
        end_date: query.endDate ? toYMD(query.endDate as string) : today,
    };

    return await $fetch(`${factoryUrl}/srv/factory-data-storage/api/tables/get_rows`, {
        method: 'GET',
        params,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
