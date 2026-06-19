const {
    public: { factoryUrl },
    walletAlias,
} = useRuntimeConfig();

const normalizeIban = (iban: string) => iban.replace(/\s+/g, '').toUpperCase();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const { amount, iban } = await readBody<{ amount: string | number; iban: string }>(event);

    if (!amount || !iban) {
        throw createError({ statusCode: 400, statusMessage: 'amount and iban are required' });
    }

    return $fetch(`${factoryUrl}/srv/payments/v0/fiat/withdraw`, {
        method: 'POST',
        body: {
            account_alias: walletAlias,
            creditor_iban: normalizeIban(iban),
            amount,
        },
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
