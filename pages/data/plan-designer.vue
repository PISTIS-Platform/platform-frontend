<script setup lang="ts">
import type {
    AssetOfferingDetails,
    InvestmentPlanDetails,
    NFTDetails,
    OneOffSaleDetails,
    SubscriptionDetails,
} from '../../interfaces/plan-designer';

//data for selected dataset

const selected = ref<string | undefined>(undefined);

//data for selection whole dataset or query

const completeOrQuery = ref<string | undefined>(undefined);

// FAIR data valuation suggestions data
//TODO: Will probably receive data from the component with its own API call

const oneOffPrice = ref(500);
const subscriptionPrice = ref(20);

// data for asset offering details

const assetOfferingDetails = ref<AssetOfferingDetails>({
    title: undefined,
    description: undefined,
    keywords: [],
});

// data for monetization selections

const monetizationSelection = ref(undefined);

// one-off sale details
const oneOffSaleDetails = ref<OneOffSaleDetails>({
    price: undefined,
    license: undefined,
    terms: undefined,
    limitNumber: undefined,
    limitFrequency: undefined,
});

//subscription details
const subscriptionDetails = ref<SubscriptionDetails>({
    frequency: undefined,
    price: undefined,
    license: undefined,
    terms: undefined,
    limitNumber: undefined,
    limitFrequency: undefined,
});

//NFT details
const NFTdetails = ref<NFTDetails>({
    price: undefined,
});

//investment plan details
const investmentPlanDetails = ref<InvestmentPlanDetails>({
    title: undefined,
    totalEqPercentage: undefined,
    minEqPercentage: undefined,
    eqPrice: undefined,
    maxNoInvestors: undefined,
});

// validation data
const isAssetOfferingDetailsValid = ref(false);
const isMonetizationValid = ref(false);

const isAllValid = computed(() => {
    return isAssetOfferingDetailsValid.value && isMonetizationValid.value;
});

const submitAll = () => {
    if (!isAllValid) return;
    //TODO: Do something for submit here
    console.log('SUCCESS');
};

// clear data when switching selection of dataset

const reset = () => {
    selected.value = undefined;
    completeOrQuery.value = undefined;
    monetizationSelection.value = undefined;
    assetOfferingDetails.value = {
        title: undefined,
        description: undefined,
        keywords: [],
    };
    oneOffSaleDetails.value = {
        price: undefined,
        license: undefined,
        terms: undefined,
        limitNumber: undefined,
        limitFrequency: undefined,
    };
    subscriptionDetails.value = {
        frequency: undefined,
        price: undefined,
        license: undefined,
        terms: undefined,
        limitNumber: undefined,
        limitFrequency: undefined,
    };
    investmentPlanDetails.value = {
        title: undefined,
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
        license: undefined,
        terms: undefined,
        limitNumber: undefined,
        limitFrequency: undefined,
    };
    subscriptionDetails.value = {
        frequency: undefined,
        price: undefined,
        license: undefined,
        terms: undefined,
        limitNumber: undefined,
        limitFrequency: undefined,
    };
    investmentPlanDetails.value = {
        title: undefined,
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
            @is-valid="(value: boolean) => (isAssetOfferingDetailsValid = value)"
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
            :NFT-details="NFTdetails"
            :is-all-valid="isAllValid"
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
            @is-monetization-valid="(value: boolean) => (isMonetizationValid = value)"
            @reset-monetization="resetMonetization"
            @submit="submitAll"
        />
    </div>
</template>
