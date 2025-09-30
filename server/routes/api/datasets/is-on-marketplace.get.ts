import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getQuery(event);

    const result: Record<string, any> = await $fetch(
        `${cloudUrl}/srv/search/search?q=${query.id}&filters=dataset&fields=offer.original_id&includes=id,offer,monetization`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        },
    );

    return !!result.result.results.length;
});
