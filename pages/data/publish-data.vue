<script setup lang="ts">
import { DatasetKind } from '~/interfaces/dataset.enum';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';
import { MonetMethod } from '~/interfaces/monetization-method.enum';

import type {
    AssetOfferingDetails,
    InvestmentPlanDetails,
    NFTDetails,
    OneOffSaleDetails,
    SubscriptionDetails,
} from '../../interfaces/plan-designer';

const { t } = useI18n();

//data for selected dataset

//TODO: Get ID and data to pass down to DatasetSelector from API call
const selected = ref<{ id: string | number; title: string; description: string }>({
    id: 1,
    title: 'Dataset 1',
    description:
        '1Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor mauris molestie elit, et lacinia ipsum quam nec dui.',
});

//data for selection whole dataset or query

const completeOrQuery = ref<string>(DatasetKind.COMPLETE);

const selectedPage = ref('planner'); //other value is 'preview'

// FAIR data valuation suggestions data
//TODO: Will probably receive data from the component with its own API call

const fairValuationInfo = ref<{
    overallRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    dataQuality: number;
    technical: number;
    business: number;
    legal: number;
    privacy: number;
}>({
    overallRating: 'A',
    dataQuality: 28,
    technical: 20,
    business: 32,
    legal: 13,
    privacy: 30,
});

const loadingValuation = ref(false);

// data for asset offering details

const assetOfferingDetails = ref<AssetOfferingDetails>({
    title: selected.value.title,
    description: selected.value.description,
    keywords: [],
});

// data for monetization selections

const monetizationSelection = ref<string>(MonetMethod.ONE_OFF);

// one-off sale details
const oneOffSaleDetails = ref<OneOffSaleDetails>({
    priceKind: undefined,
    price: undefined,
    license: undefined,
    terms: undefined,
    limitNumber: undefined,
    limitFrequency: undefined,
});

//subscription details
const subscriptionDetails = ref<SubscriptionDetails>({
    frequency: undefined,
    priceKind: undefined,
    price: undefined,
    license: undefined,
    terms: undefined,
    limitNumber: undefined,
    limitFrequency: undefined,
});

//NFT details
const detailsOfNFT = ref<NFTDetails>({
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
const isAssetOfferingDetailsValid = ref<boolean>(false);
const isMonetizationValid = ref<boolean>(false);

const isAllValid = computed(() => isAssetOfferingDetailsValid.value && isMonetizationValid.value);

const changePage = (value: string) => {
    console.log('CHANGE');
    selectedPage.value = value;
};

const submitAll = () => {
    let objToSend;

    if (!isAllValid.value) return;

    if (monetizationSelection.value === MonetMethod.ONE_OFF) {
        objToSend = {
            type: 'one-off',
            price: oneOffSaleDetails.value.price,
            assetId: selected.value.id,
            //TODO: get sellerId from same API call for asset details?
            seller: null,
            downloadlimit: {
                downloadtimes: oneOffSaleDetails.value.limitNumber,
                downloadfrequency: oneOffSaleDetails.value.limitFrequency,
                //TODO: What to put in until?
                downloaduntil: null,
            },
            license: {
                //TODO: Details for license?
                userGroupId: null,
                canResell: null,
                canShare: null,
                NumofShare: 0,
                NumofResell: 0,
                canEdit: null,
                licenseTypes: oneOffSaleDetails.value.license, //says 'exclusive on POSTMAN body'
            },
        };
    } else if (monetizationSelection.value === MonetMethod.SUBSCRIPTION) {
        objToSend = {
            type: 'subscription',
            price: subscriptionDetails.value.price,
            assetId: selected.value.id,
            //TODO: Get sellerId from same API call for asset details?
            seller: null,
            subscriptionfrequency: subscriptionDetails.value.frequency,
            downloadlimit: {
                downloadtimes: subscriptionDetails.value.limitNumber,
                downloadfrequency: subscriptionDetails.value.limitFrequency,
                //TODO: What to put in until?
                downloaduntil: null,
            },
            license: {
                //TODO: details for license?
                userGroupId: null,
                canResell: null,
                canShare: null,
                NumofShare: 0,
                NumofResell: 0,
                canEdit: null,
                licenseTypes: subscriptionDetails.value.license, //says 'exclusive' on POSTMAN body
            },
        };
    }

    //TODO: Send final object / JSON to API (blockchain)
    return objToSend;
};

// clear data when switching selection of dataset

const reset = () => {
    selected.value = {
        id: '',
        title: '',
        description: '',
    };
    completeOrQuery.value = 'Complete Dataset';
    monetizationSelection.value = MonetMethod.ONE_OFF;
    assetOfferingDetails.value = {
        title: undefined,
        description: undefined,
        keywords: [],
    };
    oneOffSaleDetails.value = {
        priceKind: undefined,
        price: undefined,
        license: undefined,
        terms: undefined,
        limitNumber: undefined,
        limitFrequency: undefined,
    };
    subscriptionDetails.value = {
        frequency: undefined,
        priceKind: undefined,
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
    detailsOfNFT.value = {
        price: undefined,
    };
};

const resetMonetization = () => {
    oneOffSaleDetails.value = {
        priceKind: undefined,
        price: undefined,
        license: undefined,
        terms: undefined,
        limitNumber: undefined,
        limitFrequency: undefined,
    };
    subscriptionDetails.value = {
        frequency: undefined,
        priceKind: undefined,
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
    detailsOfNFT.value = {
        price: undefined,
    };
};

const limitFrequencySelections = computed(() => [
    { title: t('perHour'), value: DownloadFrequency.HOUR },
    { title: t('perDay'), value: DownloadFrequency.DAY },
    { title: t('perWeek'), value: DownloadFrequency.WEEK },
    { title: t('perMonth'), value: DownloadFrequency.MONTH },
    { title: t('perYear'), value: DownloadFrequency.YEAR },
]);
</script>

<template>
    <div v-show="selectedPage === 'planner'" class="w-full h-full text-gray-700 space-y-8">
        <DatasetSelector
            :selected="selected"
            :complete-or-query="completeOrQuery"
            @update:complete-or-query="(value: string) => (completeOrQuery = value)"
            @reset="reset"
        />

        <AssetOfferingDetails
            :selected="selected"
            :asset-offering-details="assetOfferingDetails"
            :complete-or-query="completeOrQuery"
            @update:asset-title="(value: string) => (assetOfferingDetails.title = value)"
            @update:asset-description="(value: string) => (assetOfferingDetails.description = value)"
            @update:asset-keywords="(value: string[]) => (assetOfferingDetails.keywords = value)"
            @is-valid="(value: boolean) => (isAssetOfferingDetailsValid = value)"
        />

        <FairSuggestions
            v-model="fairValuationInfo"
            :loading-valuation="loadingValuation"
            :selected="selected"
            :complete-or-query="completeOrQuery"
        />

        <MonetizationMethod
            :complete-or-query="completeOrQuery"
            :selected="selected"
            :monetization-selection="monetizationSelection"
            :one-off-sale-details="oneOffSaleDetails"
            :subscription-details="subscriptionDetails"
            :investment-plan-details="investmentPlanDetails"
            :details-of-n-f-t="detailsOfNFT"
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
            @update:nft-price="(value: number) => (detailsOfNFT.price = value)"
            @is-monetization-valid="(value: boolean) => (isMonetizationValid = value)"
            @reset-monetization="resetMonetization"
            @change-page="changePage"
            @reset="reset"
        />
    </div>

    <div v-if="isAllValid">
        <div v-show="selectedPage === 'preview'" class="w-full h-full text-gray-700 space-y-8">
            <UCard v-if="completeOrQuery && selected?.title">
                <template #header>
                    <SubHeading
                        :title="$t('data.designer.assetOfferingDetails') + ' - ' + $t('preview')"
                        :info="$t('data.designer.assetOfferingDetailsInfo')"
                    />
                </template>
                <div class="flex flex-col gap-8">
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('title') }}</span>
                        <span>{{ assetOfferingDetails?.title }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('description') }}</span>
                        <span>{{ assetOfferingDetails?.description }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('keywords') }}</span>
                        <div class="flex items-center gap-2">
                            <div
                                v-for="keyword in assetOfferingDetails.keywords"
                                :key="keyword"
                                class="bg-gray-100 text-gray-500 p-1 rounded-md"
                            >
                                {{ keyword }}
                            </div>
                        </div>
                    </div>
                </div>
            </UCard>
            <UCard>
                <template #header>
                    <SubHeading
                        :title="$t('data.designer.monetizationMethod') + ' - ' + $t('preview')"
                        :info="$t('data.designer.monetizationMethodInfo')"
                    />
                </template>
                <div v-if="monetizationSelection === MonetMethod.ONE_OFF" class="flex flex-col gap-8">
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.monetizationMethod')
                        }}</span>
                        <span>{{ $t('data.designer.oneOffSale') }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.oneOffPrice') }}</span>
                        <span>{{ oneOffSaleDetails.price + ' STC' || $t('data.designer.free') }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('license') }}</span>
                        <span>{{ oneOffSaleDetails.license }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.downloadLimit') + ' & ' + $t('frequency')
                        }}</span>
                        <span>{{
                            oneOffSaleDetails.limitNumber +
                            ' ' +
                            $t('times') +
                            ' ' +
                            limitFrequencySelections.find((item) => item.value === oneOffSaleDetails.limitFrequency)
                                .title
                        }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('termsConditions') }}</span>
                        <span>{{ oneOffSaleDetails.terms }}</span>
                    </div>
                </div>
                <div v-if="monetizationSelection === MonetMethod.SUBSCRIPTION" class="flex flex-col gap-8">
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.monetizationMethod')
                        }}</span>
                        <span>{{ $t('data.designer.subscription') }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.subscriptionPrice') + ' & ' + $t('data.designer.subscriptionFrequency')
                        }}</span>
                        <span>{{
                            subscriptionDetails.price
                                ? subscriptionDetails.price +
                                  ' STC ' +
                                  (subscriptionDetails.frequency === 'annual'
                                      ? $t('data.designer.annual')
                                      : $t('data.designer.monthly'))
                                : $t('data.designer.free')
                        }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('license') }}</span>
                        <span>{{ subscriptionDetails.license }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.downloadLimit') + ' & ' + $t('frequency')
                        }}</span>
                        <span>{{
                            subscriptionDetails.limitNumber +
                            ' ' +
                            $t('times') +
                            ' ' +
                            limitFrequencySelections.find((item) => item.value === subscriptionDetails.limitFrequency)
                                .title
                        }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('termsConditions') }}</span>
                        <span>{{ subscriptionDetails.terms }}</span>
                    </div>
                </div>
                <div class="w-full flex justify-between items-center mt-8">
                    <UButton size="md" color="gray" variant="outline" @click="selectedPage = 'planner'">
                        {{ $t('back') }}
                    </UButton>
                    <UButton class="px-4 py-2" @click="submitAll">
                        {{ $t('submit') }}
                    </UButton>
                </div>
            </UCard>
        </div>
    </div>
</template>
