import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const assetId = getRouterParam(event, 'assetId');
    const token = await getToken({ event });

    return await $fetch(`${cloudUrl}/srv/intention-analytics/api/questionnaire/${assetId}/active-questionnaire`, {
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
