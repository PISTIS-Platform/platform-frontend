const {
    public: { factoryUrl },
    walletAlias,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const { amount } = await readBody<{ amount: string | number }>(event);

    if (!amount) {
        throw createError({ statusCode: 400, statusMessage: 'amount is required' });
    }

    return $fetch(`${factoryUrl}/srv/payments/v0/fiat/cash-out`, {
        method: 'POST',
        body: { amount, wallet_alias: walletAlias },
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
