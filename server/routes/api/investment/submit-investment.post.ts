const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const body = await readBody(event);

    return $fetch(`${cloudUrl}/srv/investment-planner/api/investment-planner`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
