import { getToken } from '#auth';

const { dataTransfApiUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    return event.$fetch(`${dataTransfApiUrl}/transform/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
