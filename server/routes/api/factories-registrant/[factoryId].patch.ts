import { apiPatch } from '../utils/query';

export default defineEventHandler(async (event) => {
    const accept = await readBody(event);
    const factoryId = getRouterParam(event, 'factoryId');

    const result = await apiPatch(`factories/${factoryId}/${accept.acceptance}`);
    return { result };
});
