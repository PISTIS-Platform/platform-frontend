import { getServerSession, getToken } from '#auth';
import { walletAliasObject } from '~/constants/walletAlias';
import type { TransactionsType } from '~/interfaces/wallet-transactions';

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);
    const walletKey = session?.roles?.includes('PISTIS_ADMIN') ? 'pistis-admin' : session?.orgId;
    if (!walletKey) return { incoming: [], outgoing: [] };
    const body = JSON.stringify({ wallet_alias: walletAliasObject[walletKey].alias });
    const token = await getToken({ event });

    return $fetch<TransactionsType>(`${walletAliasObject[walletKey].url}/srv/payments/v0/dlt/transactions`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
