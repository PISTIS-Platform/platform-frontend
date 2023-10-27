export interface AssetOfferingDetails {
    title: string | undefined;
    description: string | undefined;
    keywords: string[] | undefined;
}

export interface OneOffSaleDetails {
    price: number | undefined;
    license: string | undefined;
    terms: string | undefined;
    limitNumber: number | undefined;
    limitFrequency: string | undefined;
}

export interface SubscriptionDetails {
    frequency: string | undefined;
    price: number | undefined;
    license: string | undefined;
    terms: string | undefined;
    limitNumber: number | undefined;
    limitFrequency: string | undefined;
}

export interface InvestmentPlanDetails {
    title: string | undefined;
    totalEqPercentage: number | undefined;
    minEqPercentage: number | undefined;
    eqPrice: number | undefined;
    maxNoInvestors: number | undefined;
}
