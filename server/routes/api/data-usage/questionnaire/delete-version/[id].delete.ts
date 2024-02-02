import { apiDelete } from '~/server/routes/utils/query';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    const result = await apiDelete(`questionnaire/delete-version/${id}`, {});

    return { result };
});
