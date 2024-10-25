import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = await getToken({ event });

    return $fetch(`${factoryUrl}/asset-description-bundler/api/adb`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
