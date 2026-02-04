const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;

    const response = await fetch(`${factoryUrl}/srv/gdpr-checker/api/gdpr_checker/checkGDPRCompliance`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
        body,
    });

    return response;
});
