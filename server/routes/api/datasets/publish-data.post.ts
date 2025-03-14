import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = await getToken({ event });

    // DO NOT REMOVE THE TRAILING SLASH FROM THE URL!
    return $fetch(`${factoryUrl}/srv/asset-description-bundler/api/adb/`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
