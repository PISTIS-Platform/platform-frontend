import { getToken } from '#auth';

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    return $fetch(`https://develop.pistis-market.eu/srv/search/search?filter=dataset`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
