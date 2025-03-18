import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = await getToken({ event });

    return event.$fetch(`${factoryUrl}/srv/job-configurator/workflow/run`, {
        method: 'POST',
        body,
        headers: {
            'Content-type': 'multipart/form-data',
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
