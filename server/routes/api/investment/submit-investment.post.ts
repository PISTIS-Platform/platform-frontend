import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = await readBody(event);

    //FIXME: Replace with accurate deployed version when functionality gets activated
    return $fetch(`${factoryUrl}/srv/investment-planner/api/investment-planner`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
