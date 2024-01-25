import { apiGet } from '~/server/routes/utils/query';

export default defineEventHandler(async (event) => {
    const assetId = getRouterParam(event, 'assetId');

    return await apiGet(`questionnaire/asset/${assetId}`);
});
