import type { TransactionsType } from '~/interfaces/wallet-transactions';

const {
    public: { factoryUrl },
    walletAlias,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const body = JSON.stringify({ wallet_alias: walletAlias });

    return $fetch<TransactionsType>(`${factoryUrl}/srv/payments/v0/dlt/transactions`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
