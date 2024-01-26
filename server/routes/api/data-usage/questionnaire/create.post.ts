import { apiPost } from '~/server/routes/utils/query';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const result = await apiPost(`questionnaire/create/`, body);
    return { result };
});
