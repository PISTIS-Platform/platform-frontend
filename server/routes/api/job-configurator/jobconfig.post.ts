import axios from 'axios';

import { getToken } from '#auth';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    /*const body = await readBody(event);*/
    const form = await readMultipartFormData(event);

    const token = await getToken({ event });

    const formData = new FormData();

    for (const field of form) {
        if (field.filename) {
            formData.append(field.name, new Blob([field.data], { type: field.type }), field.filename);
        } else {
            formData.append(field.name, field.data);
        }
        formData.append(field.name, field.data);
    }

    return await axios.post(`${factoryUrl}/srv/job-configurator/workflow/simplifiedRun`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token?.access_token}`,
        },
    });
});
