const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;

    return event.$fetch(`${factoryUrl}/srv/job-configurator/workflow/stopWorkflowRun`, {
        method: 'DELETE',
        body,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
