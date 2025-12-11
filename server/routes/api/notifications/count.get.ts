const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;

    return $fetch(`${cloudUrl}/srv/notifications/api/notifications/count`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
