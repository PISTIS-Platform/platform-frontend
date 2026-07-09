import type { MarketInsightVolumeChangeByGranularity } from './market-insight-volume-change';

export interface MarketInsightSalesVolume {
    increasing: number;
    decreasing: number;
    stable: number;
}

export interface MarketInsightOverview {
    totalAssets: number;
    totalSales: number;
    totalMarketCap: number;
    averageSalesPerDay: number;
    salesVolume: MarketInsightSalesVolume;
    volumeChanges: MarketInsightVolumeChangeByGranularity[];
}
