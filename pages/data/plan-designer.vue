<script setup lang="ts">
import type {
    AssetOfferingDetails,
    InvestmentMonetisationPlan,
    NFTMonetisationPlan,
    OneOfMonetisationPlan,
    SubscriptionMonetisationPlan,
} from '../../interfaces/plan-designer';

//data for selected dataset

const selected = ref<string>('');

//data for selection whole dataset or query

const completeOrQuery = ref<string>('');

// FAIR data valuation suggestions data
//TODO: Will probably receive data from the component with its own API call

const oneOffPrice = ref<number>(500);
const subscriptionPrice = ref<number>(20);

// data for asset offering details

const assetOfferingDetails = ref<AssetOfferingDetails>({
    title: undefined,
    description: undefined,
    keywords: [],
    license: undefined,
    terms: undefined,
});

// data for monetization selections

const monetizationSelection = ref<string>('');

// one-off sale details
const oneOffSaleDetails = ref<OneOfMonetisationPlan>({
    price: undefined,
    limit: {
        times: null,
        frequency: null,
        until: null,
    },
    type: 'one-off',
    assetId: '',
});

//subscription details
const subscriptionDetails = ref<SubscriptionMonetisationPlan>({
    frequency: 'monthly',
    price: undefined,
    limit: {
        times: null,
        frequency: null,
    },
    type: 'subscription',
    assetId: '',
});

//NFT details
const detailsOfNFT = ref<NFTMonetisationPlan>({
    price: undefined,
    type: 'nft',
    assetId: '',
    token: '',
});

//investment plan details
const investmentPlanDetails = ref<InvestmentMonetisationPlan>({
    title: '',
    type: 'investment',
    price: undefined,
    assetId: '',
    minPercentage: 0,
    totalPercentage: 0,
    maxInvestors: 0,
    limit: { until: null },
});

// validation data
const isAssetOfferingDetailsValid = ref<boolean>(false);
const isMonetizationValid = ref<boolean>(false);

const frequency = (value: string) => {
    switch (value) {
        case 'per hour':
            return 'hour';
        case 'per day':
            return 'day';
        case 'per week':
            return 'week';
        case 'per month':
            return 'month';
        case 'per year':
            return 'year';
    }
};

const isAllValid = computed(() => isAssetOfferingDetailsValid.value && isMonetizationValid.value);

const submitAll = () => {
    if (!isAllValid.value) return;
    console.log(monetizationSelection);
    // const payload =
    //TODO: Do something for submit here
    console.log('SUCCESS');
};

// clear data when switching selection of dataset

const reset = () => {
    selected.value = '';
    completeOrQuery.value = '';
    monetizationSelection.value = '';
    assetOfferingDetails.value = {
        title: undefined,
        description: undefined,
        keywords: [],
        license: undefined,
        terms: undefined,
    };
    oneOffSaleDetails.value = {
        price: undefined,
        limit: {
            times: null,
            frequency: null,
            until: null,
        },
        type: 'one-off',
        assetId: '',
    };
    subscriptionDetails.value = {
        frequency: 'monthly',
        price: undefined,
        limit: {
            times: null,
            frequency: null,
        },
        type: 'subscription',
        assetId: '',
    };
    investmentPlanDetails.value = {
        title: '',
        type: 'investment',
        price: undefined,
        assetId: '',
        minPercentage: 0,
        totalPercentage: 0,
        maxInvestors: 0,
        limit: { until: null },
    };
    detailsOfNFT.value = {
        price: undefined,
        type: 'nft',
        assetId: '',
        token: '',
    };
};

const resetMonetization = () => {
    oneOffSaleDetails.value = {
        price: undefined,
        limit: {
            times: null,
            frequency: null,
            until: null,
        },
        type: 'one-off',
        assetId: '',
    };
    subscriptionDetails.value = {
        frequency: 'monthly',
        price: undefined,
        limit: {
            times: null,
            frequency: null,
        },
        type: 'subscription',
        assetId: '',
    };
    investmentPlanDetails.value = {
        title: '',
        type: 'investment',
        price: undefined,
        assetId: '',
        minPercentage: 0,
        totalPercentage: 0,
        maxInvestors: 0,
        limit: { until: null },
    };
    detailsOfNFT.value = {
        price: undefined,
        type: 'nft',
        assetId: '',
        token: '',
    };
};
</script>

<template>
    <div class="w-full h-full text-gray-700 space-y-8">
        <h1 class="text-2xl">
            {{ $t('data.designer.title') }}
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
            @update:asset-license="(value: string) => (assetOfferingDetails.license = value)"
            @update:asset-terms="(value: string) => (assetOfferingDetails.terms = value)"
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
            :details-of-n-f-t="detailsOfNFT"
            :is-all-valid="isAllValid"
            @update:monetization-selection="(value: string) => (monetizationSelection = value)"
            @update:oneoff-price="(value: number) => (oneOffSaleDetails.price = value)"
            @update:oneoff-date="(value: Date) => (oneOffSaleDetails.limit.until = value)"
            @update:oneoff-limit-number="(value: number) => (oneOffSaleDetails.limit.times = value)"
            @update:oneoff-limit-frequency="
                (value: string) => (oneOffSaleDetails.limit.frequency = frequency(value) as any)
            "
            @update:sub-frequency="(value: string) => (subscriptionDetails.limit.frequency = frequency(value) as any)"
            @update:sub-price="(value: number) => (subscriptionDetails.price = value)"
            @update:sub-limit-number="(value: number) => (subscriptionDetails.limit.times = value)"
            @update:sub-limit-frequency="
                (value: string) => (subscriptionDetails.limit.frequency = frequency(value) as any)
            "
            @update:plan-title="(value: string) => (investmentPlanDetails.title = value)"
            @update:plan-total-eq-percentage="(value: number) => (investmentPlanDetails.totalPercentage = value)"
            @update:plan-min-eq-percentage="(value: number) => (investmentPlanDetails.minPercentage = value)"
            @update:plan-eq-price="(value: number) => (investmentPlanDetails.price = value)"
            @update:plan-max-no-investors="(value: number) => (investmentPlanDetails.maxInvestors = value)"
            @update:nft-price="(value: number) => (detailsOfNFT.price = value)"
            @is-monetization-valid="(value: boolean) => (isMonetizationValid = value)"
            @reset-monetization="resetMonetization"
            @submit="submitAll"
            @reset="reset"
        />
    </div>
</template>
