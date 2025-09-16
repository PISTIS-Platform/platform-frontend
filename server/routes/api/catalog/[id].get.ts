import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const id = getRouterParam(event, 'id');

    const response = await $fetch(`${cloudUrl}/srv/repo/datasets/${id}`, {
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    return response['@graph'];
});
