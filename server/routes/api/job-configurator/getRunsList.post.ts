import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = await getToken({ event });

    return event.$fetch(
        `${factoryUrl}/srv/job-configurator/workflow/getWorkflowRunList?workflow_id=pistis_workflow_template`,
        {
            method: 'POST',
            body,
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        },
    );
});
