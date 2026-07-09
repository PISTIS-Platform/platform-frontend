export type MarketInsightGranularity = 'day' | 'week' | 'month';

export interface MarketInsightVolumeChange {
    volumeChange: number;
    volumeChangePct: number | null;
}

export interface MarketInsightVolumeChangeByGranularity extends MarketInsightVolumeChange {
    granularity: MarketInsightGranularity;
}
