import { createError, readBody } from 'h3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;
    const ownerFactoryURL = body.ownerFactoryURL;

    if (!ownerFactoryURL) {
        throw createError({ statusCode: 400, statusMessage: 'ownerFactoryURL is required' });
    }

    const targetUrl = `${ownerFactoryURL.replace(/\/?$/, '')}/api/datavalue/`;
    // const localTestTargetUrl = 'http://localhost:8000/api/datavalue/';

    const headers = {} as Record<string, string>;
    if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`;
    }

    const payload = { ...body };
    delete payload.ownerFactoryURL;

    console.log('Submitting valuation to DVS at', targetUrl, 'with payload:', payload);
    console.log('Using headers:', headers);

    return $fetch(targetUrl, {
        method: 'POST',
        body: payload,
        headers,
    });
});
