import { getToken } from '#auth';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    return $fetch(config.public.marketUrl + '/identity-access-management/api/v1/ape/attributes/domains', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
