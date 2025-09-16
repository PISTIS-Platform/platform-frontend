import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getQuery(event);

    const response = await $fetch(
        `${cloudUrl}/srv/investment-planner/api/investment-planner/retrieve/${query.cloudAssetId}`,
        {
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        },
    );

    return response;
});
