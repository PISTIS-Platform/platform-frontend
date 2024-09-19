import { getToken } from '#auth';

const { sctcUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = await readBody(event);

    return $fetch(`${sctcUrl}/sctc/compose`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
