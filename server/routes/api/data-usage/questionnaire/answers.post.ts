import { apiPost } from '~/server/routes/utils/query';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    return await apiPost(`questionnaire/answers`, body);
});
