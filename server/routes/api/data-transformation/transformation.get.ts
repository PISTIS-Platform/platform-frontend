import { getToken } from '#auth';

const { baseDevelopUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    return event.$fetch(`${baseDevelopUrl}/data-transformation/transform/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
