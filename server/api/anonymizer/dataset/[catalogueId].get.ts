import { getToken } from '#auth';

const { baseDevelopUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = (await getToken({ event })) || { access_token: 'null' };
    const catalogueId: string = getRouterParam(event, 'catalogueId') || '';
    const distribution: string = getRouterParam(event, 'distribution') || '0';
    const language: string = getRouterParam(event, 'language') || 'en';

    const params = {
        distribution: distribution,
        language: language,
    };

    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${baseDevelopUrl}/anonymiser/api/dataset/${catalogueId}?${queryString}`, {
        headers: { Authorization: `Bearer ${token!.access_token}` },
    });
    const json = await response.json();

    return json;
});
