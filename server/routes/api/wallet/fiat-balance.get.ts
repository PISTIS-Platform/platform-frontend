const {
    public: { factoryUrl },
    factoryName,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    return $fetch<{ amount: string; currency: string }>(`${factoryUrl}/srv/payments/v0/fiat/wallets/balance`, {
        method: 'POST',
        body: { account_id: factoryName },
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
