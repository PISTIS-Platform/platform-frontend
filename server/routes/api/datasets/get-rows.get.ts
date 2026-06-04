const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const query = getQuery(event);

    const toYMD = (d: string) => new Date(d).toISOString().slice(0, 10);

    const params = {
        asset_uuid: query.assetUuid,
        column_name: query.columnName,
        column_datatype: 'date',
        start_date: toYMD(query.startDate as string),
        end_date: toYMD(query.endDate as string),
    };

    return await $fetch(`${factoryUrl}/srv/factory-data-storage/api/tables/get_rows`, {
        method: 'GET',
        params,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
