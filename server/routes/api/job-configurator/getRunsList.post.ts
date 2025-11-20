const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = event.context.session;

    return event.$fetch(
        `${factoryUrl}/srv/job-configurator/workflow/getWorkflowRunList?workflow_id=pistis_workflow_template`,
        {
            method: 'POST',
            body,
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        },
    );
});
