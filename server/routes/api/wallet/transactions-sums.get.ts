const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;

    return $fetch(`${cloudUrl}/srv/transactions-auditor/api/transactions-auditor/transaction/summary`, {
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
