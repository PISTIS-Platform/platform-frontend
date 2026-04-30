const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const body = await readBody(event);

    try {
        return await $fetch(`${cloudUrl}/srv/distributed-query/search`, {
            method: 'POST',
            body,
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        });
    } catch (error) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Bad Gateway: The distributed query service is currently unavailable.',
        });
    }
});
