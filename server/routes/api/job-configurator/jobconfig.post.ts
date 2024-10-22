import { getToken } from '#auth';

const { jobConfigApiUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = await getToken({ event });

    return event.$fetch(`${jobConfigApiUrl}/workflow/run`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
