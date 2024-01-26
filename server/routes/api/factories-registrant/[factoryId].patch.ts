import { apiPatch } from '../utils/query';

export default defineEventHandler(async (event) => {
    const factoryId = getRouterParam(event, 'factoryId');

    const result = await apiPatch(`factories/${factoryId}/`);
    return { result };
});
