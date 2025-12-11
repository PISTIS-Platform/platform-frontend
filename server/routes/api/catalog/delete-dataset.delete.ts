export default defineEventHandler(async (event) => {
    const { datasetId } = getQuery(event);
    const config = useRuntimeConfig();

    if (!datasetId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'datasetId is required',
        });
    }

    const endpoint = `${config.public.factoryUrl}/srv/repo/datasets/${datasetId}`;
    const apiKey = config.piveauHubRepoXApiKey;

    const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
    });

    if (!response.ok) {
        const msg = await response.text();
        throw createError({
            statusCode: 500,
            statusMessage: `Delete failed: ${msg}`,
        });
    }

    return { success: true };
});
