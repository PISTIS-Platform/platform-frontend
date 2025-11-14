const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;

    return event.$fetch(`${factoryUrl}/srv/data-transformation/transform/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
