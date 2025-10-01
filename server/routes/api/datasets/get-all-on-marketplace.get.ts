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

    let page = 0;
    let innerResult: any;
    let outerResults: Record<string, any>[] = [];

    do {
        innerResult = await $fetch<Record<string, any>>(
            `${cloudUrl}/srv/search/search?page=${page}&limit=1000&filters=dataset&facets=${encodeURIComponent(JSON.stringify(facets))}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
            },
        );
        page++;
        innerResult = innerResult?.result?.results;
        outerResults = outerResults.concat(innerResult);
    } while (innerResult?.length);

    return outerResults;
});
