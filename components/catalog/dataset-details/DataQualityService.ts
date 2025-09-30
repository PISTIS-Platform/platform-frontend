import axios from 'axios';

const config = useRuntimeConfig();
const backendUrl = config.public.factoryUrl;

export async function getDatasetMetrics(datasetId: string) {
    const response = await axios.get(`${backendUrl}/srv/mqa/datasets/${datasetId}`);
    return response.data;
}

export async function getDistributionsMetrics(datasetId: string) {
    const response = await axios.get(`${backendUrl}/srv/mqa/datasets/${datasetId}/distributions`);

    return response.data;
}
