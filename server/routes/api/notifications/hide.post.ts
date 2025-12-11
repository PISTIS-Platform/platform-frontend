const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;

    return $fetch(`${cloudUrl}/srv/notifications/api/notifications/${body.notificationId}/hide`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
