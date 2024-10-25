import { getToken } from '#auth';

const { baseMarketUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = await getToken({ event });

    return $fetch(`${baseMarketUrl}/notifications/api/notifications/${body.notificationId}/read`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
