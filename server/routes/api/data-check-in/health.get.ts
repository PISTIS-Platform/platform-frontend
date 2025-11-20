const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;

    return event.$fetch(`${factoryUrl}/srv/data-check-in/data/health`, {
        method: 'GET',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
