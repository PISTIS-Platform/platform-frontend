const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const body = await readBody(event);
    const session = event.context.session;

    if (query.lite_version === undefined) {
        query.lite_version = 'true';
    }

    return event.$fetch(`${factoryUrl}/srv/insights-generator/insights/?lite_version=${query.lite_version}`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
            Accept: `${query.Accept}`,
        },
    });
});
