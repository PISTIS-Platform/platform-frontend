import { getServerSession, getToken } from '#auth';
import { walletAliasObject } from '~/constants/walletAlias';

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);
    const walletKey = session?.roles?.includes('PISTIS_ADMIN') ? 'pistis-admin' : session?.orgId;
    if (!walletKey) return 0;
    const body = JSON.stringify({ wallet_alias: walletAliasObject[walletKey].alias });
    const token = await getToken({ event });

    return $fetch<any>(`${walletAliasObject[walletKey].url}/srv/payments/v0/dlt/wallets/balance`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
