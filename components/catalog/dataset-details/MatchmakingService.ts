import axios from 'axios';

import { useApiService } from '~/services/apiService';

const route = useRoute();
const pistisMode = route.query.pm;
const { getSimilarityBasedMatchingDatasetsUrl } = useApiService(pistisMode);
const { getUserBasedMatchingDatasetsUrl } = useApiService(pistisMode);

export async function getSimilarityBasedMatchingDatasets(offerId: string) {
    const response = await axios.get(getSimilarityBasedMatchingDatasetsUrl(offerId));

    return response.data;
}

export async function getUserBasedMatchingDatasets(offerId: string) {
    const response = await axios.get(getUserBasedMatchingDatasetsUrl(offerId));

    return response.data;
}
