import { getToken } from '#auth';
import type { TransactionsType } from '~/interfaces/wallet-transactions';

const {
    public: { factoryUrl },
    walletAlias,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = JSON.stringify({ wallet_alias: walletAlias });

    return $fetch<TransactionsType>(`${factoryUrl}/srv/payments/v0/dlt/transactions`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
