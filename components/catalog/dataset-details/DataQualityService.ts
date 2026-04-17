import axios from 'axios';

const config = useRuntimeConfig();
const backendUrl = config.public.factoryUrl;
const marketplaceUrl = config.public.cloudUrl;

//catalogue:
export async function getDatasetMetrics(datasetId: string) {
    const response = await axios.get(`${backendUrl}/srv/mqa/datasets/${datasetId}`);
    return response.data;
}

export async function getDistributionsMetrics(datasetId: string) {
    const response = await axios.get(`${backendUrl}/srv/mqa/datasets/${datasetId}/distributions`);
    return response.data;
}

export async function getDistributionsDataQualityMetrics(datasetId: string) {
    const response = await axios.get(`${backendUrl}/srv/search/resources/data-quality/${datasetId}`);
    return response.data;
}

//marketplace:
export async function getDatasetMetricsMarketplace(datasetId: string) {
    const response = await axios.get(`${marketplaceUrl}/srv/mqa/datasets/${datasetId}`);
    return response.data;
}

export async function getDistributionsMetricsMarketplace(datasetId: string) {
    const response = await axios.get(`${marketplaceUrl}/srv/mqa/datasets/${datasetId}/distributions`);
    return response.data;
}

export async function getDistributionsDataQualityMetricsMarketplace(datasetId: string) {
    const response = await axios.get(`${marketplaceUrl}/srv/search/resources/data-quality/${datasetId}`);
    return response.data;
}
