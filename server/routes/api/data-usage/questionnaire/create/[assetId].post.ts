import { apiPost } from '~/server/routes/utils/query';

export default defineEventHandler(async (event) => {
    const assetId = getRouterParam(event, 'assetId');
    const body = await readBody(event);

    const result = await apiPost(`questionnaire/create/${assetId}`, body);
    return { result };
});
