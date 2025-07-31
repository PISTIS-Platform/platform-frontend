import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    const result = await $fetch(`${cloudUrl}/srv/factories-registry/api/factories/user-factory`, {
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    return result;
});
