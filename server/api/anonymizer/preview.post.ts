const { anonymizerApiUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const response = await fetch(`${anonymizerApiUrl}/api/dataset/preview/obfuscate`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(body),
    });
    const json = await response.json();

    return json['result']['dataset'];
});
