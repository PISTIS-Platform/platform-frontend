const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = (await getToken({ event })) || { access_token: 'null' };

    const response = await fetch(`${factoryUrl}/srv/anonymiser/api/dataset/synthetic-data`, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            Authorization: `Bearer ${token!.access_token}`,
        },
    });
    const json = await response.json();

    return json;
});
