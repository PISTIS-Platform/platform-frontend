const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = (await getToken({ event })) || { access_token: 'null' };
    const query = getQuery(event);

    const datasetId: string = getRouterParam(event, 'datasetId') || '';
    const distribution: string = query.distribution?.toString() || '0';
    const language: string = query.language?.toString() || 'en';

    const params = {
        distribution: distribution,
        language: language,
    };

    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${factoryUrl}/srv/anonymiser/api/dataset/${datasetId}?${queryString}`, {
        headers: { Authorization: `Bearer ${token!.access_token}` },
    });
    const json = await response.json();

    return json;
});
