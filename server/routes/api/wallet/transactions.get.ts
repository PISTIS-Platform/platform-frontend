const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const query = getQuery(event);

    return $fetch(
        `${cloudUrl}/srv/transactions-auditor/api/transactions-auditor/transaction/factory?page=${query.page}&sortBy=property[${query.sortByColumn}]%3Bdirection[${query.sortByDirection}]`,
        {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        },
    );
});
