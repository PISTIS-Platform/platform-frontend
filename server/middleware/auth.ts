import { getServerSession } from '#auth';

const { orgId } = useRuntimeConfig().public;

export default eventHandler(async (event) => {
    const session = await getServerSession(event);

    if (!session && event.path.startsWith('/api')) {
        throw createError({ statusMessage: 'Unauthenticated', statusCode: 401 });
    }
    if (session && session.orgId !== orgId && event.path.startsWith('/api')) {
        throw createError({ statusMessage: 'Forbidden', statusCode: 403 });
    }
});
