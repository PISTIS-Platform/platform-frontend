export interface MarketInsightAssetPerformance {
    assetId: string;
    assetName: string;
    price: number;
    totalSales: number;
    marketCap: number;
    changePct: number | null;
}

export interface MarketInsightPerformingAssets {
    top: MarketInsightAssetPerformance[];
    worst: MarketInsightAssetPerformance[];
}
