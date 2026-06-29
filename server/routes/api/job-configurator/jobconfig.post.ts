import axios from 'axios';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    /*const body = await readBody(event);*/
    console.log('Entering jobconfig.post.ts');
    const incoming = await readFormData(event);

    const session = event.context.session;

    const formData = new FormData();

    for (const [name, value] of incoming.entries()) {
        if (value instanceof File) {
            const ab = await value.arrayBuffer();
            formData.append(name, new Blob([ab], { type: value.type }), value.name);
        } else {
            formData.append(name, String(value));
        }
    }

    const response = await axios.post(`${factoryUrl}/srv/job-configurator/workflow/simplifiedRun`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${session?.token}`,
        },
    });
    const json_data = response.data;

    console.log('Axios Response:' + JSON.stringify(json_data, null, 2));
    return json_data;
});
