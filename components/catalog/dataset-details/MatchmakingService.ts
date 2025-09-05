import axios from 'axios';

const config = useRuntimeConfig();
const backendUrl = config.public.cloudUrl;

export async function getMatchingDatasets(offerId: string) {
    const response = await axios.get(`${backendUrl}/srv/matchmaking-services/api/mms/${offerId}?format=json`);

    return response.data;
}
