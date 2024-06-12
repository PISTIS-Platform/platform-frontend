import { getToken } from '#auth';

const { intentionAnalyticsServerUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    //const assetId = getRouterParam(event, 'assetId');
    const token = await getToken({ event });

    //TODO:: backend url can be changed according to what we will keep in backend
    //TODO:: send asset id (maybe this would require changes in the backend to retrieve it)

    return await $fetch(`${intentionAnalyticsServerUrl}/questionnaire/active-version/verified-buyers`, {
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
