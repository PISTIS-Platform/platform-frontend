import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = await getToken({ event });

    return event.$fetch(`${factoryUrl}/srv/data-check-in/data/health`, {
        method: 'GET',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
