import { getToken } from '#auth';

const { baseDevelopUrl } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = await getToken({ event });

    return event.$fetch(`${baseDevelopUrl}/job-configurator/workflow/fetchWorkflowRun`, {
        method: 'POST',
        body,
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
