export const useApiService = (pistisMode: string = 'cloud') => {
    const config = useRuntimeConfig();

    let baseUrl = config.public.cloudUrl;
    if (pistisMode === 'factory') {
        baseUrl = config.public.factoryUrl;
    }
    if (pistisMode === 'openData') {
        baseUrl = config.public.openDataPortalUrl;
    }

    let searchUrl = `${baseUrl}/srv/search/`;
    if (pistisMode === 'openData') {
        searchUrl = `${baseUrl}/api/hub/search/`;
    }
    const getSearchUrl = () => searchUrl;

    const getRepoUrl = () => `${baseUrl}/srv/repo/`;

    const getDistributionsUrl = () => `${baseUrl}/srv/repo/distributions/`;

    const getDatasetUrl = (datasetId: string) => `${baseUrl}/srv/search/datasets/${datasetId}`;

    const getMarketplaceDatasetUrl = (datasetId: string) =>
        `${config.public.cloudUrl}/srv/search/datasets/${datasetId}`;

    const getUserFactoryUrl = () => `${config.public.cloudUrl}/srv/factories-registry/api/factories/user-factory`;

    const getInvestUrl = (datasetId: string) => `${config.public.factoryUrl}/invest/${datasetId}`;

    const getFeedbackUrl = (datasetId?: string) => `/marketplace/usage-analytics/${datasetId}/questionnaire`;

    const getPurchaseUrl = (factoryPrefix: string) =>
        `https://${factoryPrefix}.${config.public.cloudUrl.replace(/^https?:\/\//, '')}/srv/smart-contract-execution-engine/api/scee/storePurchase`;

    const getEnrichmentUrl = (datasetId: string, distributionId: string, format: string) =>
        `${baseUrl}/srv/enrichment-ui/?datasetId=${datasetId}&distributionId=${distributionId}&file_type=${format}`;

    const getAnonymizerUrl = (datasetId: string, distributionId: string, lang: string = 'en') =>
        `/anonymizer?datasetId=${datasetId}&distribution=${distributionId}&language=${lang}`;

    const getMatchingDatasetsUrl = (offerId: string) =>
        `${config.public.cloudUrl}/srv/matchmaking-services/api/mms/${encodeURIComponent(offerId)}?format=json`;

    const getBlockchainHashUrl = () => `${config.public.factoryUrl}/srv/lineage-tracker/blockchain-hash`;

    const getDatasetDiffUrlLimited = (datasetFactoryUrl: string) =>
        `${datasetFactoryUrl}/srv/lineage-tracker/get_datasets_diff_limit`;

    const getDatasetDiffUrl = (backendUrl: string) => `${backendUrl}/srv/lineage-tracker/get_datasets_diff`;

    const getLineageDataUrl = (backendUrl: string) => `${backendUrl}/srv/lineage-tracker/get_dataset_family_tree`;

    const getMarketplaceSparqlEndpoint = () => `https://pistis-market.eu/srv/virtuoso/sparql`;

    const getSCEEUrl = (offerId: string) =>
        `${config.public.factoryUrl}/srv/smart-contract-execution-engine/api/scee/getTransactionInfo/assetId/${offerId}`;

    const getSCEEAssetUrl = (datasetId: string) =>
        `${config.public.factoryUrl}/srv/smart-contract-execution-engine/api/scee/GetAsset/${datasetId}`;

    const getSCEEBurnNftUrl = () => `${config.public.factoryUrl}/srv/smart-contract-execution-engine/api/scee/burnNFT`;

    return {
        baseUrl,
        getSearchUrl,
        getRepoUrl,
        getDistributionsUrl,
        getDatasetUrl,
        getMarketplaceDatasetUrl,
        getUserFactoryUrl,
        getInvestUrl,
        getFeedbackUrl,
        getPurchaseUrl,
        getEnrichmentUrl,
        getAnonymizerUrl,
        getMatchingDatasetsUrl,
        getBlockchainHashUrl,
        getDatasetDiffUrlLimited,
        getDatasetDiffUrl,
        getLineageDataUrl,
        getMarketplaceSparqlEndpoint,
        getSCEEUrl,
        getSCEEAssetUrl,
        getSCEEBurnNftUrl,
    };
};
