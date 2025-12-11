const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const body = await readBody(event);
    const query = await getQuery(event);

    return $fetch(`${cloudUrl}/srv/investment-planner/api/investment-planner/update/${query.investmentId}`, {
        method: 'PUT',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
