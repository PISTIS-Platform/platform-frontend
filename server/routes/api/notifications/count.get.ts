import { getToken } from '#auth';

const { notificationsUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    return $fetch(notificationsUrl + '/count', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
