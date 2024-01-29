import { apiPut } from '~/server/routes/utils/query';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const id = getRouterParam(event, 'id');

    const result = await apiPut(`questionnaire/${id}`, body);
    return { result };
});
