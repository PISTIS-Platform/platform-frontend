import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = await readBody(event);
    const query = await getQuery(event);

    return $fetch(`${cloudUrl}/srv/investment-planner/api/investment-planner/update/${query.investmentId}`, {
        method: 'PUT',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
