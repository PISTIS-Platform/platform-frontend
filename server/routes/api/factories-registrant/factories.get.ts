import { apiGet } from '../utils/query';

export default defineEventHandler(async () => {
    return await apiGet(`factories`);
});
