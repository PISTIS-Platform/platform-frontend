const {
    public: { factoryUrl },
    walletAlias,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const body = JSON.stringify({ wallet_alias: walletAlias });

    return $fetch<any>(`${factoryUrl}/srv/payments/v0/dlt/wallets/balance`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
