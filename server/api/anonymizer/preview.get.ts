import { getToken } from '#auth';

const { baseDevelopUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = (await getToken({ event })) || { access_token: 'null' };

    const response = await fetch(`${baseDevelopUrl}/anonymiser/api/dataset/preview`, {
        headers: { Authorization: `Bearer ${token!.access_token}` },
    });
    const json = await response.json();

    return json;
});
