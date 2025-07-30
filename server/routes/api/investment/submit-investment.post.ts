import { getToken } from '#auth';

const {
    public: { _factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = await readBody(event);

    //FIXME: Change URL with deployed version
    return $fetch(`http://localhost:3030/api/investment-planner`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
