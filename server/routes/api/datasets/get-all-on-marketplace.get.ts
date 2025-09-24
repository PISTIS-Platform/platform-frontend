import { getToken } from '#auth';

const {
    public: { cloudUrl },
    organisationFullname,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = await getQuery(event);

    const facets = {
        monetizationType: ['one-off', 'subscription'],
        publisher: [organisationFullname],
        is_free: query?.nonFree ? [false] : [],
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
