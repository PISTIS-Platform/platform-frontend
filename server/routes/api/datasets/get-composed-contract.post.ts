const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const body = await readBody(event);

    return $fetch(`${factoryUrl}/srv/sctc/api/sctc/compose`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
