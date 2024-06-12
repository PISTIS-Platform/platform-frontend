import { getToken } from '#auth';

const { intentionAnalyticsServerUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const body = await readBody(event);
    const token = await getToken({ event });

    return await $fetch(`${intentionAnalyticsServerUrl}/questionnaire/${query.id}/${query.version}/answers`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
