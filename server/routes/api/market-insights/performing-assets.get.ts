import type { MarketInsightPerformingAssets } from '~/interfaces/market-insight-performing-assets';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event): Promise<MarketInsightPerformingAssets> => {
    const session = event.context.session;
    const { limit } = getQuery(event);

    const baseUrl = `${cloudUrl}/srv/transactions-auditor/api/transactions-auditor`;

    return $fetch(`${baseUrl}/market-insights/performing-assets`, {
        query: limit ? { limit } : undefined,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
