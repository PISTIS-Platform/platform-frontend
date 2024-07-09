import { getServerSession } from '#auth';

const { orgId } = useRuntimeConfig();

export default eventHandler(async (event) => {
    const session = await getServerSession(event);
    if ((!session || session.orgId !== orgId) && event.path.startsWith('/api')) {
        throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 });
    }
});
