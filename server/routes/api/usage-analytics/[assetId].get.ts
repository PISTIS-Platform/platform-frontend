import { getToken } from '#auth';

const { baseMarketUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const assetId = getRouterParam(event, 'assetId');
    const token = await getToken({ event });

    return await $fetch(`${baseMarketUrl}/intention-analytics/api/questionnaire/${assetId}/active-questionnaire/`, {
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
