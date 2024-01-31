import { apiPost } from '~/server/routes/utils/query';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const id = getRouterParam(event, 'id');

    const result = await apiPost(`questionnaire/activate-version/${id}`, body);

    return { result };
});
