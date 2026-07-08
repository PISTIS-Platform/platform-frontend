import type { MarketInsightVolumeChangeByGranularity } from '~/interfaces/market-insight-volume-change';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

export default defineEventHandler(async (event): Promise<MarketInsightVolumeChangeByGranularity[]> => {
    const session = event.context.session;

    const baseUrl = `${cloudUrl}/srv/transactions-auditor/api/transactions-auditor`;

    // No granularity → backend returns the change for all granularities (day, week, month).
    return $fetch(`${baseUrl}/market-insights/volume-change`, {
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    });
});
