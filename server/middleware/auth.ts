import { getServerSession } from '#auth';

const { orgId } = useRuntimeConfig().public;

export default eventHandler(async (event) => {
    // Only validate API routes
    if (event.path.startsWith('/api')) {
        const session = await getServerSession(event);

        if (!session) {
            throw createError({ statusMessage: 'Unauthenticated', statusCode: 401 });
        }

        // Validate that session has a valid token from server-side storage
        if (!session.token) {
            throw createError({
                statusMessage: 'Session invalid - please logout and login again',
                statusCode: 401,
            });
        }

        if (session.orgId !== orgId) {
            throw createError({ statusMessage: 'Forbidden', statusCode: 403 });
        }

        // Store session in context so handlers can reuse it
        event.context.session = session;
    }
});
