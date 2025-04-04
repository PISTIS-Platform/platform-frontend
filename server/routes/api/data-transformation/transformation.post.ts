import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const body = await readBody(event);
    const token = await getToken({ event });

    return event.$fetch(`${factoryUrl}/srv/data-transformation/transform/`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
            Accept: `${query.Accept}`,
        },
    });
});
