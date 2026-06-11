import axios from 'axios';

const config = useRuntimeConfig();
const factoryUrl = config.public.factoryUrl;
const cloudUrl = config.public.cloudUrl;

//catalogue:
export async function getDatasetMetrics(datasetId: string) {
    const response = await axios.get(`${factoryUrl}/srv/mqa/datasets/${datasetId}`);
    return response.data;
}

export async function getDistributionsMetrics(datasetId: string) {
    const response = await axios.get(`${factoryUrl}/srv/mqa/datasets/${datasetId}/distributions`);
    return response.data;
}

export async function getDistributionsDataQualityMetrics(datasetId: string) {
    const response = await axios.get(`${factoryUrl}/srv/search/resources/data-quality/${datasetId}`);
    return response.data;
}

//marketplace:
export async function getDatasetMetricsMarketplace(datasetId: string) {
    const response = await axios.get(`${cloudUrl}/srv/mqa/datasets/${datasetId}`);
    return response.data;
}

export async function getDistributionsMetricsMarketplace(datasetId: string) {
    const response = await axios.get(`${cloudUrl}/srv/mqa/datasets/${datasetId}/distributions`);
    return response.data;
}

export async function getDistributionsDataQualityMetricsMarketplace(datasetId: string) {
    const response = await axios.get(`${cloudUrl}/srv/search/resources/data-quality/${datasetId}`);
    return response.data;
}
