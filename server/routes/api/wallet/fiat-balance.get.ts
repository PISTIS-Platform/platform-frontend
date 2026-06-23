const {
    public: { factoryUrl, cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const factory = await $fetch<{ iban: string }>(`${cloudUrl}/srv/factories-registry/api/factories/user-factory`, {
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });

    const iban = factory?.iban;
    if (!iban) {
        console.warn('No factory IBAN available; skipping balance request');
        return;
    }

    return $fetch<{ amount: string; currency: string }>(`${factoryUrl}/srv/payments/v0/fiat/wallets/balance`, {
        method: 'POST',
        body: { iban },
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
