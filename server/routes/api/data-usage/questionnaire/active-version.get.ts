import { apiGet } from '~/server/routes/utils/query';

export default defineEventHandler(async (event) => {
    const { for_verified_buyers } = getQuery(event);

    return await apiGet(`questionnaire-answers/active-version?for_verified_buyers=${for_verified_buyers}`);
});
