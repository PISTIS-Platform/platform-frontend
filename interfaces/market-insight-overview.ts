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
}
