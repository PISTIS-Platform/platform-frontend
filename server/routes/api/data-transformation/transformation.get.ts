import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    return event.$fetch(`${factoryUrl}/srv/data-transformation/transform/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
