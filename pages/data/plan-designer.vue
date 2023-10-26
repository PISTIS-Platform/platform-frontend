<script setup lang="ts">
//data for selected dataset

const selected = ref('');

//data for selection whole dataset or query

const completeOrQuery = ref('');

// FAIR data valuation suggestions data

const oneOffPrice = ref(500);
const subscriptionPrice = ref(20);

// data for asset offering details

const assetOfferingDetails = ref<any>({
    title: '',
    description: '',
    keywords: [],
});

// data for monetization selections

const monetizationSelection = ref('');

// one-off sale details
const oneOffSaleDetails = ref<any>({
    price: undefined,
    license: '',
    terms: '',
    limitNumber: undefined,
    limitFrequency: '',
});

//subscription details
const subscriptionDetails = ref<any>({
    frequency: '',
    price: undefined,
    license: '',
    terms: '',
    limitNumber: undefined,
    limitFrequency: '',
});

//investment plan details
const investmentPlanDetails = ref<any>({
    title: '',
    totalEqPercentage: undefined,
    minEqPercentage: undefined,
    eqPrice: undefined,
    maxNoInvestors: undefined,
});

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
            @update:title="(value: string[]) => (assetOfferingDetails.title = value)"
            @update:description="(value: string[]) => (assetOfferingDetails.description = value)"
            @update:keywords="(value: string[]) => (assetOfferingDetails.keywords = value)"
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
            @update:monetization-selection="(value: string) => (monetizationSelection = value)"
            @update:oneoff-price="(value: number) => (oneOffSaleDetails.price = value)"
            @update:oneoff-license="(value: number) => (oneOffSaleDetails.license = value)"
            @update:oneoff-terms="(value: number) => (oneOffSaleDetails.terms = value)"
            @update:oneoff-limit-number="(value: number) => (oneOffSaleDetails.limitNumber = value)"
            @update:oneoff-limit-frequency="(value: number) => (oneOffSaleDetails.limitFrequency = value)"
            @update:sub-frequency="(value: number) => (subscriptionDetails.frequency = value)"
            @update:sub-price="(value: number) => (subscriptionDetails.price = value)"
            @update:sub-license="(value: number) => (subscriptionDetails.license = value)"
            @update:sub-terms="(value: number) => (subscriptionDetails.terms = value)"
            @update:sub-limit-number="(value: number) => (subscriptionDetails.limitNumber = value)"
            @update:sub-limit-frequency="(value: number) => (subscriptionDetails.limitFrequency = value)"
            @update:plan-title="(value: string) => (investmentPlanDetails.title = value)"
            @update:plan-total-eq-percentage="(value: string) => (investmentPlanDetails.totalEqPercentage = value)"
            @update:plan-min-eq-percentage="(value: string) => (investmentPlanDetails.minEqPercentage = value)"
            @update:plan-eq-price="(value: string) => (investmentPlanDetails.eqPrice = value)"
            @update:plan-max-no-investors="(value: string) => (investmentPlanDetails.maxNoInvestors = value)"
        />
    </div>
</template>
