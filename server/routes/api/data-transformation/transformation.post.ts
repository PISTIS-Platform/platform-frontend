const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const body = await readBody(event);
    const session = event.context.session;

    return event.$fetch(`${factoryUrl}/srv/data-transformation/transform/`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
            Accept: `${query.Accept}`,
        },
    });
});
