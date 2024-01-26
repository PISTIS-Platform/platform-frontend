import { apiPut } from '../utils/query';

export default defineEventHandler(async (event) => {
    const factoryId = getRouterParam(event, 'factoryId');
    const body = await readBody(event);

    return await apiPut(`factories/${factoryId}/`, body);
});
