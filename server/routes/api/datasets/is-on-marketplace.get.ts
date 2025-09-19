import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getQuery(event);

    const targetUrl = `${cloudUrl}/srv/search/search?q=${query.id}&filters=dataset&fields=offer.original_id&includes=id,offer,monetization`;

    console.log({ targetUrl });
    try {
        const response = await $fetch(targetUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        });
        return response;
    } catch (error) {
        return { error: 'Failed to fetch data' };
    }
});
