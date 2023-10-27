export interface AssetOfferingDetails {
    title: string;
    description: string;
    keywords: string[];
}

export interface OneOffSaleDetails {
    price: number | undefined;
    license: string;
    terms: string;
    limitNumber: number | undefined;
    limitFrequency: string;
}

export interface SubscriptionDetails {
    frequency: string;
    price: number | undefined;
    license: string;
    terms: string;
    limitNumber: number | undefined;
    limitFrequency: string;
}

export interface InvestmentPlanDetails {
    title: string;
    totalEqPercentage: number | undefined;
    minEqPercentage: number | undefined;
    eqPrice: number | undefined;
    maxNoInvestors: number | undefined;
}

export interface NFTdetails {
    price: number | undefined;
}
