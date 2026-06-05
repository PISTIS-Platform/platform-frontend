const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;

    const targetUrl = `${factoryUrl}/srv/data-valuation-service/api/datavalue/`;
    // TODO: remove hardcoded local test URL and use targetUrl instead once DVS endpoint is stable and accessible
    // const localTestTargetUrl = 'http://localhost:8000/api/datavalue/';

    //DO NOT REMOVE THE TRAILING SLASH FROM THE URL
    return $fetch(targetUrl, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
