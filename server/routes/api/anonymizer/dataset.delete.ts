const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;

    const response = await fetch(`${factoryUrl}/srv/anonymiser/api/dataset/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
    });
    const json = await response.json();

    return json;
});
