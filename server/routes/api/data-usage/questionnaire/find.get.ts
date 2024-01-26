import { apiGet } from '~/server/routes/utils/query';

export default defineEventHandler(async (event) => {
    const { assetId } = getQuery(event);

    if (assetId) {
        return await apiGet(`questionnaire/${assetId}`);
    }

    return await apiGet(`questionnaire`);
});
