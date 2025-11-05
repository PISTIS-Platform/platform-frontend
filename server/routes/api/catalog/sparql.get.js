export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const config = useRuntimeConfig();

    const params = new URLSearchParams({
        'default-graph-uri': '',
        query: query.query || '',
        format: 'application/sparql-results+json',
        timeout: '0',
        signal_void: 'on',
    });

    try {
        const response = await $fetch(`${config.public.factoryUrl}/srv/virtuoso/sparql?${params}`, {
            method: 'GET',
            headers: {
                accept: 'application/sparql-results+json,application/json,*/*',
            },
        });

        return response;
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'SPARQL query failed',
            data: error,
        });
    }
});
