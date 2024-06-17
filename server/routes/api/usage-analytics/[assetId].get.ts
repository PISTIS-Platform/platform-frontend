import { getToken } from '#auth';

const { intentionAnalyticsServerUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const assetId = getRouterParam(event, 'assetId');
    const token = await getToken({ event });

    return await $fetch(`${intentionAnalyticsServerUrl}/questionnaire/${assetId}/active-questionnaire/`, {
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
