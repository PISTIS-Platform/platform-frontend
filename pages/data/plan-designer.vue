<script setup lang="ts">
import type {
    AssetOfferingDetails,
    InvestmentPlanDetails,
    NFTdetails,
    OneOffSaleDetails,
    SubscriptionDetails,
} from '../../interfaces/plan-designer';

//data for selected dataset

const selected = ref('');

//data for selection whole dataset or query

const completeOrQuery = ref('');

// FAIR data valuation suggestions data
//TODO: Will probably receive data from the component with its own API call

const oneOffPrice = ref(500);
const subscriptionPrice = ref(20);

// data for asset offering details

const assetOfferingDetails = ref<AssetOfferingDetails>({
    title: '',
    description: '',
    keywords: [],
});

// data for monetization selections

const monetizationSelection = ref('');

// one-off sale details
const oneOffSaleDetails = ref<OneOffSaleDetails>({
    price: undefined,
    license: '',
    terms: '',
    limitNumber: undefined,
    limitFrequency: '',
});

//subscription details
const subscriptionDetails = ref<SubscriptionDetails>({
    frequency: '',
    price: undefined,
    license: '',
    terms: '',
    limitNumber: undefined,
    limitFrequency: '',
});

//NFT details
const NFTdetails = ref<NFTdetails>({
    price: undefined,
});

//investment plan details
const investmentPlanDetails = ref<InvestmentPlanDetails>({
    title: '',
    totalEqPercentage: undefined,
    minEqPercentage: undefined,
    eqPrice: undefined,
    maxNoInvestors: undefined,
});

// validation data
const isAssetOfferingDetailsValid = ref(false);
// const isOneOffSaleDetailsValid = ref(false);
// const isSubscriptionDetailsValid = ref(false);
// const isInvestmentPlanDetailsValid = ref(false);
// const isNFTdetailsValid = ref(false);

// clear data when switching selection of dataset

const reset = () => {
    selected.value = '';
    completeOrQuery.value = '';
    monetizationSelection.value = '';
    assetOfferingDetails.value = {
        title: '',
        description: '',
        keywords: [],
    };
    oneOffSaleDetails.value = {
        price: undefined,
        license: '',
        terms: '',
        limitNumber: undefined,
        limitFrequency: '',
    };
    subscriptionDetails.value = {
        frequency: '',
        price: undefined,
        license: '',
        terms: '',
        limitNumber: undefined,
        limitFrequency: '',
    };
    investmentPlanDetails.value = {
        title: '',
        totalEqPercentage: undefined,
        minEqPercentage: undefined,
        eqPrice: undefined,
        maxNoInvestors: undefined,
    };
    NFTdetails.value = {
        price: undefined,
    };
};

const resetMonetization = () => {
    oneOffSaleDetails.value = {
        price: undefined,
        license: '',
        terms: '',
        limitNumber: undefined,
        limitFrequency: '',
    };
    subscriptionDetails.value = {
        frequency: '',
        price: undefined,
        license: '',
        terms: '',
        limitNumber: undefined,
        limitFrequency: '',
    };
    investmentPlanDetails.value = {
        title: '',
        totalEqPercentage: undefined,
        minEqPercentage: undefined,
        eqPrice: undefined,
        maxNoInvestors: undefined,
    };
    NFTdetails.value = {
        price: undefined,
    };
};
</script>

<template>
    <div class="w-full h-full text-gray-700">
        <h1 class="text-2xl font-bold">
            {{ $t('data.designer') }}
        </h1>

        <DatasetSelector
            :selected="selected"
            :complete-or-query="completeOrQuery"
            @update:selected="(value: string) => (selected = value)"
            @update:complete-or-query="(value: string) => (completeOrQuery = value)"
            @reset="reset"
        />

        <AssetOfferingDetails
            :asset-offering-details="assetOfferingDetails"
            :complete-or-query="completeOrQuery"
            @update:asset-title="(value: string) => (assetOfferingDetails.title = value)"
            @update:asset-description="(value: string) => (assetOfferingDetails.description = value)"
            @update:asset-keywords="(value: string[]) => (assetOfferingDetails.keywords = value)"
            @isValid="(value: boolean) => (isAssetOfferingDetailsValid = value)"
        />

        <FairSuggestions
            v-model:oneOffPrice="oneOffPrice"
            v-model:subscriptionPrice="subscriptionPrice"
            :complete-or-query="completeOrQuery"
        />

        <MonetizationMethod
            :complete-or-query="completeOrQuery"
            :monetization-selection="monetizationSelection"
            :one-off-sale-details="oneOffSaleDetails"
            :subscription-details="subscriptionDetails"
            :investment-plan-details="investmentPlanDetails"
            :NFTdetails="NFTdetails"
            @update:monetization-selection="(value: string) => (monetizationSelection = value)"
            @update:oneoff-price="(value: number) => (oneOffSaleDetails.price = value)"
            @update:oneoff-license="(value: string) => (oneOffSaleDetails.license = value)"
            @update:oneoff-terms="(value: string) => (oneOffSaleDetails.terms = value)"
            @update:oneoff-limit-number="(value: number) => (oneOffSaleDetails.limitNumber = value)"
            @update:oneoff-limit-frequency="(value: string) => (oneOffSaleDetails.limitFrequency = value)"
            @update:sub-frequency="(value: string) => (subscriptionDetails.frequency = value)"
            @update:sub-price="(value: number) => (subscriptionDetails.price = value)"
            @update:sub-license="(value: string) => (subscriptionDetails.license = value)"
            @update:sub-terms="(value: string) => (subscriptionDetails.terms = value)"
            @update:sub-limit-number="(value: number) => (subscriptionDetails.limitNumber = value)"
            @update:sub-limit-frequency="(value: string) => (subscriptionDetails.limitFrequency = value)"
            @update:plan-title="(value: string) => (investmentPlanDetails.title = value)"
            @update:plan-total-eq-percentage="(value: number) => (investmentPlanDetails.totalEqPercentage = value)"
            @update:plan-min-eq-percentage="(value: number) => (investmentPlanDetails.minEqPercentage = value)"
            @update:plan-eq-price="(value: number) => (investmentPlanDetails.eqPrice = value)"
            @update:plan-max-no-investors="(value: number) => (investmentPlanDetails.maxNoInvestors = value)"
            @update:nft-price="(value: number) => (NFTdetails.price = value)"
            @reset-monetization="resetMonetization"
        />
    </div>
</template>
