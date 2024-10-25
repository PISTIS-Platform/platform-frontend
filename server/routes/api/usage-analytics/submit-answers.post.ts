import { getToken } from '#auth';

const { baseMarketUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const body = await readBody(event);
    const token = await getToken({ event });

    return await $fetch(`${baseMarketUrl}/intention-analytics/api/questionnaire/${query.id}/${query.version}/answers`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
