export interface AssetOfferingDetails {
    title: string | undefined;
    description: string | undefined;
    keywords: string[] | undefined;
    license: string | undefined;
    terms: string | undefined;
}

export interface OneOffSaleDetails {
    price: number | undefined;
    date: Date | undefined;
    limitNumber: number | undefined;
    limitFrequency: string | undefined;
}

export interface SubscriptionDetails {
    frequency: string | undefined;
    price: number | undefined;
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

export interface NFTDetails {
    price: number | undefined;
}

export type BaseMonetisationPlan = {
    type: 'one-off' | 'subscription' | 'nft' | 'investment';
    price: number | undefined;
    assetId: string;
};

export type DownloadLimit = {
    times: number | null;
    frequency: 'hour' | 'day' | 'week' | 'month' | 'year' | null;
    until?: Date | null;
};

export type OneOfMonetisationPlan = BaseMonetisationPlan & {
    type: 'one-off';
    limit: DownloadLimit;
};

export type SubscriptionMonetisationPlan = BaseMonetisationPlan & {
    type: 'subscription';
    frequency: 'monthly' | 'annual';
    limit: DownloadLimit;
};

export type NFTMonetisationPlan = BaseMonetisationPlan & {
    type: 'nft';
    token: string;
};

export type InvestmentMonetisationPlan = BaseMonetisationPlan & {
    type: 'investment';
    title: string;
    minPercentage: number;
    totalPercentage: number;
    maxInvestors: number;
    limit: { until: Date | null };
};

export type MonetisationPlan =
    | OneOfMonetisationPlan
    | SubscriptionMonetisationPlan
    | NFTMonetisationPlan
    | InvestmentMonetisationPlan;
