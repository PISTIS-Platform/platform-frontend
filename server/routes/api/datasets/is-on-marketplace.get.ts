import { defineEventHandler, getQuery } from 'h3';
import { $fetch } from 'ofetch';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const sparqlQuery = query.query;

    const targetUrl = `${cloudUrl}/srv/virtuoso/sparql?query=${encodeURIComponent(sparqlQuery)}`;

    try {
        const response = await $fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/sparql-query',
            },
        });
        return response;
    } catch (error) {
        console.error('Proxy error:', error);
        return { error: 'Failed to fetch data' };
    }
});
