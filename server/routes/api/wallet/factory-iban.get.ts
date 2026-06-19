const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const factory = await $fetch<{ iban: string }>(`${cloudUrl}/srv/factories-registry/api/factories/user-factory`, {
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
    return { iban: factory?.iban ?? '' };
});
