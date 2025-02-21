import { getToken } from '#auth';
import type { TransactionsType } from '~/interfaces/wallet-transactions';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

//TODO: Get wallet alias from pinia instead of body?

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const body = await readBody(event);

    return $fetch<TransactionsType>(`${factoryUrl}/srv/payments/v0/dlt/transactions`, {
        method: 'POST',
        body: { wallet_alias: body.walletAlias },
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
