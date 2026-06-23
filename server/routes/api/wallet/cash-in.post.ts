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

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
        throw createError({ statusCode: 400, statusMessage: 'amount must be a number' });
    }

    return $fetch(`${factoryUrl}/srv/payments/v0/fiat/cash-in`, {
        method: 'POST',
        body: { amount: numericAmount, wallet_alias: walletAlias },
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
