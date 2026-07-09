import type { MarketInsightTimelinePoint } from '~/interfaces/market-insight-asset-timeline';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event): Promise<MarketInsightTimelinePoint[]> => {
    const session = event.context.session;

    const baseUrl = `${cloudUrl}/srv/transactions-auditor/api/transactions-auditor`;

    return $fetch(`${baseUrl}/market-insights/timeline`, {
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
