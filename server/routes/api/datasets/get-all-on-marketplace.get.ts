import { getToken } from '#auth';

const {
    public: { cloudUrl },
    organisationFullName,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    // const tokenData = jwtDecode(token?.access_token);

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

    console.log({ results });

    return results.result.results;
});
