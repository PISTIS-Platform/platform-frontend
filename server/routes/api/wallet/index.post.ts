import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

//TODO: Get from wallet alias from pinia instead of body?

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    // const body = JSON.stringify({ wallet_alias: walletAlias });
    const body = await readBody(event);

    return $fetch<any>(`${factoryUrl}/srv/payments/v0/dlt/wallets/balance`, {
        method: 'POST',
        body: JSON.stringify({ wallet_alias: body.walletAlias }),
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
