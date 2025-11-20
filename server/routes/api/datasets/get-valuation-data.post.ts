const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;

    //DO NOT REMOVE THE TRAILING SLASH FROM THE URL
    return $fetch(`${factoryUrl}/srv/data-valuation-service/api/datavalue/`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
