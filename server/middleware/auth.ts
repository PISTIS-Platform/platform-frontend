import { getServerSession } from '#auth';

const { orgId } = useRuntimeConfig();

console.log(orgId);

//TODO: Compare user logged in organisationId to factory's orgId, if not the same give unathenticated

export default eventHandler(async (event) => {
    const session = await getServerSession(event);
    if (!session && event.path.startsWith('/api')) {
        throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 });
    }
});
