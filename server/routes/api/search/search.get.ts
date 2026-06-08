export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig();

    // session is populated by server/middleware/auth.ts for /api routes
    const session = (event.context as any).session;

    // pick pistis mode from query (cloud/factory/openData)
    const query = getQuery(event) as Record<string, string>;
    const pistisMode = query.pm || 'cloud';

    // remove our proxy-only query keys
    const forwardedQuery = { ...query };
    delete forwardedQuery.pm;

    const baseUrl =
        pistisMode === 'factory'
            ? runtimeConfig.public.factoryUrl
            : pistisMode === 'openData'
              ? runtimeConfig.public.openDataPortalUrl
              : runtimeConfig.public.cloudUrl;

    const targetUrl = `${baseUrl.replace(/\/$/, '')}/srv/search/search?${new URLSearchParams(forwardedQuery).toString()}`;

    const headers: Record<string, string> = {};
    if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
    }

    try {
        const res = await $fetch(targetUrl, {
            headers,
        });
        return res;
    } catch (err: any) {
        throw createError({ statusCode: err?.status || 502, statusMessage: err?.message || 'Bad Gateway' });
    }
});
