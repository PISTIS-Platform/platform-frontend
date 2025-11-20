const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;

    const response = await fetch(`${factoryUrl}/srv/anonymiser/api/k-anon/solution/apply`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify(body),
    });
    const json = await response.json();

    return json;
});
