import { apiGet } from '../utils/query';

export default defineEventHandler(async () => {
    const result = await apiGet(`factories/`);
    return { result };
});
