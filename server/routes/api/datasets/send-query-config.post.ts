const {
    public: { _factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;

    return $fetch(`http://localhost:3010/api/provider/query-selector`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });

    //  return $fetch(`${factoryUrl}/srv/data-connector/api/provider/query-selector`, {
    //     method: 'POST',
    //     body,
    //     headers: {
    //         Authorization: `Bearer ${session?.token}`,
    //     },
    // });
});
