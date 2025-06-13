import { getToken } from '#auth';

const {
    public: { connectorUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = await readBody(event);

    return $fetch(`${connectorUrl}/api/provider/kafka-user/${body.id}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
