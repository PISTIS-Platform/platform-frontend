import { getToken } from '#auth';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getQuery(event);

    const filter = query.searchString ? `&filter[assetName]=$ilike:${query.searchString}` : '';

    return $fetch(
        `${cloudUrl}/srv/transactions-auditor/api/transactions-auditor?page=${query.page}&sortBy=property[${query.sortByColumn}];direction[${query.sortByDirection}]` +
            filter,
        {
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
        },
    );
});
