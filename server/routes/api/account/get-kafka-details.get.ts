import { getToken } from '#auth';

const {
    public: { connectorUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const results = await $fetch(`${connectorUrl}/api/provider`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    console.log({ results });

    return results;
});
