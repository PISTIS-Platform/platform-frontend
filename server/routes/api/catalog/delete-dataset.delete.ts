export default defineEventHandler(async (event) => {
    const { datasetId } = getQuery(event);
    const config = useRuntimeConfig();

    if (!datasetId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'datasetId is required',
        });
    }

    const authHeader = getHeader(event, 'authorization');

    if (!authHeader) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Missing Authorization header',
        });
    }

    const baseUrl = config.public.factoryUrl;
    const endpoint = `${baseUrl}/srv/repo/datasets/${datasetId}`;
    const apiKey = config.piveauHubRepoXApiKey;
    const dataStorageApi = `${baseUrl}/srv/factory-data-storage/api`;
    const authToken = authHeader.replace('Bearer ', '');

    // load dataset
    const datasetResponse = await fetch(endpoint, {
        method: 'GET',
    });

    if (!datasetResponse.ok) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to load dataset distributions',
        });
    }

    const dataset = await datasetResponse.json();
    const distributions = dataset?.distributions ?? [];

    // delete distributions
    for (const dist of distributions) {
        const distId = dist.id;
        const accessUrl = dist.access_url;
        const isStream = dist.title === 'Kafka Stream';
        const format = dist.format?.id ?? '';

        try {
            const isSql = format.includes('sql');

            if (isSql) {
                await fetch(`${dataStorageApi}/tables/delete_table?asset_uuid=${distId}`, { method: 'DELETE' });
            } else {
                await fetch(`${dataStorageApi}/files/delete_file?asset_uuid=${distId}`, { method: 'DELETE' });
            }

            // delete data storage for non stream dataset
            if (!isStream && accessUrl) {
                await fetch(accessUrl, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
            }
        } catch (err) {
            console.error('Failed to delete distribution', distId, err);
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to delete dataset distributions',
            });
        }
    }

    // verify all distributions are deleted
    for (const dist of distributions) {
        const distId = dist.id;
        const accessUrl = dist.access_url;

        if (!accessUrl) continue;

        try {
            const checkResponse = await fetch(accessUrl, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (![400, 404].includes(checkResponse.status)) {
                throw createError({
                    statusCode: 409,
                    statusMessage: `Distribution ${distId} is still accessible (status ${checkResponse.status})`,
                });
            }
        } catch (err: any) {
            if (err?.statusCode) {
                throw err;
            }

            throw createError({
                statusCode: 500,
                statusMessage: `Failed to verify deletion of distribution ${distId}`,
            });
        }
    }

    // delete Dataset
    const deleteResponse = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
    });

    if (!deleteResponse.ok) {
        const msg = await deleteResponse.text();
        throw createError({
            statusCode: 500,
            statusMessage: `Delete failed: ${msg}`,
        });
    }

    return { success: true };
});
