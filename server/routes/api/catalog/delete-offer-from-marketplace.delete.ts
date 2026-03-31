export default defineEventHandler(async (event) => {
    const { offerId } = getQuery(event);
    const config = useRuntimeConfig();

    if (!offerId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'offerId is required',
        });
    }

    const baseUrl = config.public.cloudUrl;
    const endpoint = `${baseUrl}/srv/repo/datasets/${offerId}`;
    const apiKey = config.marketplaceApiKey;

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

    return {
        success: true,
    };
});
