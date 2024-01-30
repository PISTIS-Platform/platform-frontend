import { apiGet } from '~/server/routes/utils/query';

export default defineEventHandler(async () => {
    return await apiGet(`questionnaire/versions`);
});
