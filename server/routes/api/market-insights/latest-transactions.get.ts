import type { MarketInsightLatestTransaction } from '~/interfaces/market-insight-latest-transaction';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event): Promise<MarketInsightLatestTransaction[]> => {
    const session = event.context.session;
    const { limit } = getQuery(event);

    const baseUrl = `${cloudUrl}/srv/transactions-auditor/api/transactions-auditor`;

    return $fetch(`${baseUrl}/market-insights/latest-transactions`, {
        query: limit ? { limit } : undefined,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
