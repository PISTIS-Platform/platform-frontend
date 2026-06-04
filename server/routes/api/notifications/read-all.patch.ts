const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;

    return $fetch(`${cloudUrl}/srv/notifications/api/notifications/user/read-all`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
