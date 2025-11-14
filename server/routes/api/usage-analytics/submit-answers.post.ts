const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const body = await readBody(event);
    const session = event.context.session;

    return await $fetch(`${cloudUrl}/srv/intention-analytics/api/questionnaire/${query.id}/${query.version}/answers`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
