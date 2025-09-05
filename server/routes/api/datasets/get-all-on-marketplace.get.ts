import { getToken } from '#auth';

const {
    public: { cloudUrl },
    organisationFullName,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const facets = {
        monetizationType: ['one-off', 'subscription'],
        publisher: [organisationFullName],
    };

    const results: any = await $fetch(
        `${cloudUrl}/srv/search/search?filters=dataset&facets=${encodeURIComponent(JSON.stringify(facets))}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        },
    );

    return results.result.results;
});
