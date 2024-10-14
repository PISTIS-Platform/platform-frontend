export interface AssetOfferingDetails {
    title: string | undefined;
    description: string | undefined;
    keywords: string[];
}

export interface AccessPolicyDetails {
    id: string | undefined;
    title: string | undefined;
    description: string | undefined;
    default: boolean;
    scopes: string[];
    groups: string[];
    countries: string[];
    sizes: string[];
    domains: string[];
    types: string[];
}

export interface AccessPolicies {
    assetId: string | undefined;
    assetTitle: string | undefined;
    assetDescription: string | undefined;
    policyData: AccessPolicyDetails[];
}
