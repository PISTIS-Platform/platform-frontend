import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const token = await getToken({ event });

    return $fetch(`${cloudUrl}/srv/intention-analytics/api/questionnaire/${query.assetId}/answers`, {
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
