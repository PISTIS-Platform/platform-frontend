import axios from 'axios';

import { useApiService } from '~/services/apiService';

const route = useRoute();
const pistisMode = route.query.pm;
const { getMatchingDatasetsUrl } = useApiService(pistisMode);

export async function getMatchingDatasets(offerId: string) {
    const response = await axios.get(getMatchingDatasetsUrl(offerId));

    return response.data;
}
