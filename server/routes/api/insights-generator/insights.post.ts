import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const body = await readBody(event);
    const token = await getToken({ event });

    if (query.lite_version === undefined) {
        query.lite_version = 'true';
    }

    return event.$fetch(`${factoryUrl}/srv/insights-generator/insights/?lite_version=${query.lite_version}`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
            Accept: `${query.Accept}`,
        },
    });
});
