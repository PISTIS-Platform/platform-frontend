import { getToken } from '#auth';

const { baseDevelopUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const body = await readBody(event);
    const token = await getToken({ event });

    return event.$fetch(`${baseDevelopUrl}/insights-generator/insights/`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
            Accept: `${query.Accept}`,
        },
    });
});
