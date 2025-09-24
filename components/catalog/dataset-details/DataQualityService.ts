import axios from 'axios';

const config = useRuntimeConfig();
const backendUrl = config.public.factoryUrl;

export async function getMetricsData(datasetId: string) {
    const response = await axios.get(`${backendUrl}/srv/mqa/datasets/${datasetId}/distributions`);

    return response.data;
}
