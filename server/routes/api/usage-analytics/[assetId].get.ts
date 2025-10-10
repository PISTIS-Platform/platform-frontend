import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const assetId = getRouterParam(event, 'assetId');
    const query = getQuery(event);
    const token = await getToken({ event });

    if (query.forVerifiedBuyers) {
        return await $fetch(
            `${cloudUrl}/srv/intention-analytics/api/questionnaire/${assetId}/active-questionnaire/verified-buyers`,
            {
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
            },
        );
    } else {
        return await $fetch(
            `${cloudUrl}/srv/intention-analytics/api/questionnaire/${assetId}/active-questionnaire/general-users`,
            {
                headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
            },
        );
    }
});
