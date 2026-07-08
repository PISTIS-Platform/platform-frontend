import type { MarketInsightAssetTimeline } from '~/interfaces/market-insight-asset-timeline';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event): Promise<MarketInsightAssetTimeline[]> => {
    const session = event.context.session;
    const { limit } = getQuery(event);

    const baseUrl = `${cloudUrl}/srv/transactions-auditor/api/transactions-auditor`;

    return $fetch(`${baseUrl}/market-insights/assets/timeline`, {
        query: limit ? { limit } : undefined,
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
