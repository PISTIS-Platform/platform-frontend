import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    return $fetch(`${cloudUrl}/srv/transactions-auditor/api/transactions-auditor/transaction/sums-by-factory`, {
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
