import type { MarketInsightOverview } from '~/interfaces/market-insight-overview';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event): Promise<MarketInsightOverview> => {
    const session = event.context.session;

    const baseUrl = `${cloudUrl}/srv/transactions-auditor/api/transactions-auditor`;

    return $fetch(`${baseUrl}/market-insights`, {
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
