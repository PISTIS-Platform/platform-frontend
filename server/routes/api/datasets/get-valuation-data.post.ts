// const {
//     public: { factoryUrl },
// } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody<Record<string, unknown>>(event);
    const session = event.context.session;

    const { dvsUrl, ...payload } = body;
    // TODO it should never use factoryURL
    // const targetUrl = typeof dvsUrl === 'string' && dvsUrl.length
    //     ? dvsUrl
    //     : `${factoryUrl}/srv/data-valuation-service/api/datavalue/`;
    if (typeof dvsUrl !== 'string' || !dvsUrl.length) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid dvsUrl' });
    }

    console.log('Proxy URL :: Submitting valuation to DVS at', dvsUrl, 'with payload:\n', payload);

    // DO NOT REMOVE THE TRAILING SLASH FROM THE URL
    return $fetch(dvsUrl, {
        method: 'POST',
        body: payload,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
