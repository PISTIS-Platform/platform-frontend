export interface MarketInsightTimelinePoint {
    day: string;
    sales: number;
    amount: number;
}

export interface MarketInsightAssetTimeline {
    assetId: string;
    assetName: string;
    amount: number;
    changePct: number | null;
    series: MarketInsightTimelinePoint[];
}
