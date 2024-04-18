const { anonymizerApiUrl } = useRuntimeConfig();
import { getToken } from '#auth';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = (await getToken({ event })) || { access_token: 'null' };

    const response = await fetch(`${anonymizerApiUrl}/api/k-anon/solution`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            Authorization: `Bearer ${token!.access_token}`,
        },
        body: JSON.stringify(body),
    });
    const json = await response.json();

    return json['result'];
});
