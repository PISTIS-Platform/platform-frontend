const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;

    const results = await $fetch(`${factoryUrl}/srv/data-connector/api/consumer`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });

    return results;
});
