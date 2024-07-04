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

const { showErrorMessage } = useAlertMessage();

const { t } = useI18n();

//data for selected dataset

//TODO: Get ID and data to pass down to DatasetSelector from API call
const selected = ref<{ id: string | number; title: string; description: string } | undefined>(undefined);

//TODO: Get list of datasets from API call
const dataSets: { id: string | number; title: string; description: string }[] = [
    {
        id: 1,
        title: 'Dataset 1',
        description:
            '1Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor mauris molestie elit, et lacinia ipsum quam nec dui.',
    },
    {
        id: 2,
        title: 'Dataset 2',
        description:
            '1Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor mauris molestie elit, et lacinia ipsum quam nec dui.',
    },
    {
        id: 3,
        title: 'Dataset 3',
        description:
            '1Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor mauris molestie elit, et lacinia ipsum quam nec dui.',
    },
];

//data for selection whole dataset or query

const completeOrQuery = ref<string>(DatasetKind.COMPLETE);

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
    title: undefined,
    description: undefined,
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

const steps = [
    { id: 'Step 1', name: t('data.designer.nav.selectDataset'), href: 'select', status: 'current' },
    { id: 'Step 2', name: t('data.designer.nav.monetizationPlanner'), href: 'planner', status: 'upcoming' },
    { id: 'Step 3', name: t('data.designer.nav.accessPoliciesEditor'), href: 'editor', status: 'upcoming' },
    { id: 'Step 4', name: t('data.designer.nav.preview'), href: 'preview', status: 'upcoming' },
];

const selectedPage = ref('select'); //other value is 'preview'

const handleStepSelect = (href: string) => {
    const index = steps.findIndex((item) => item.href === href);

    switch (index) {
        case 0:
            selectedPage.value = href;
            break;
        case 1:
            if (selected.value) {
                selectedPage.value = href;
            } else {
                showErrorMessage(t('data.designer.pleaseSelectDataset'));
            }
            break;
        case 2:
            if (selected.value && isAllValid.value) {
                selectedPage.value = href;
            }
            break;
        case 3:
            //TODO: Check both step 3 and if the access policies editor is ready
            if (selected.value && isAllValid.value) {
                selectedPage.value = href;
            }
            break;
    }

    for (let i = 0; i < steps.length; i++) {
        if (i < index) {
            steps[i].status = 'complete';
        } else if (i === index) {
            steps[i].status = 'current';
        } else {
            steps[i].status = 'upcoming';
        }
    }
};

const handleDatasetSelection = (dataset: { id: string | number; title: string; description: string }) => {
    selected.value = dataset;
    assetOfferingDetails.value.title = selected.value.title;
    assetOfferingDetails.value.description = selected.value.description;
    handleStepSelect('planner');
};
</script>

<template>
    <nav aria-label="Progress" class="w-full mb-8">
        <ol role="list" class="space-y-4 md:flex md:space-x-8 md:space-y-0">
            <li
                v-for="step in steps"
                :key="step.name"
                class="md:flex-1 cursor-pointer"
                @click="handleStepSelect(step.href)"
            >
                <a
                    v-if="step.status === 'complete'"
                    class="group flex flex-col border-l-4 border-indigo-600 py-2 pl-4 hover:border-indigo-800 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                >
                    <span class="text-sm font-medium text-indigo-600 group-hover:text-indigo-800">{{ step.id }}</span>
                    <span class="text-sm font-medium">{{ step.name }}</span>
                </a>
                <a
                    v-else-if="step.status === 'current'"
                    class="flex flex-col border-l-4 border-indigo-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                    aria-current="step"
                >
                    <span class="text-sm font-medium text-indigo-600">{{ step.id }}</span>
                    <span class="text-sm font-medium">{{ step.name }}</span>
                </a>
                <a
                    v-else
                    class="group flex flex-col border-l-4 border-gray-200 py-2 pl-4 hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                >
                    <span class="text-sm font-medium text-gray-500 group-hover:text-gray-700">{{ step.id }}</span>
                    <span class="text-sm font-medium">{{ step.name }}</span>
                </a>
            </li>
        </ol>
    </nav>

    <div v-show="selectedPage === 'select'" class="w-full h-full text-gray-700 space-y-8">
        <UCard v-for="dataset in dataSets" :key="dataset.id">
            <template #header>
                <span class="font-bold">{{ dataset.title }}</span>
            </template>
            <p>
                {{ dataset.description }}
            </p>
            <template #footer>
                <div class="flex justify-end w-full">
                    <UButton @click="handleDatasetSelection(dataset)">{{ $t('select') }}</UButton>
                </div>
            </template>
        </UCard>
    </div>

    <div v-show="selectedPage === 'planner'" class="w-full h-full text-gray-700 space-y-8">
        <DatasetSelector
            v-if="selected"
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
            :is-all-valid="isAllValid"
            @update:monetization-selection="(value: string) => (monetizationSelection = value)"
            @update:one-off-sale-details="(value: OneOffSaleDetails) => (oneOffSaleDetails = value)"
            @update:subscription-details="(value: SubscriptionDetails) => (subscriptionDetails = value)"
            @update:nft-details="(value: NFTDetails) => (detailsOfNFT = value)"
            @update:investment-details="(value: InvestmentPlanDetails) => (investmentPlanDetails = value)"
            @is-monetization-valid="(value: boolean) => (isMonetizationValid = value)"
            @reset-monetization="resetMonetization"
            @change-page="handleStepSelect"
            @reset="reset"
        />
    </div>

    <div v-show="selectedPage === 'editor'">Access policies editor</div>

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
                    <div class="flex items-start gap-8">
                        <div class="flex gap-2 flex-col">
                            <span class="text-sm font-semibold text-gray-400">{{
                                $t('data.designer.monetizationMethod')
                            }}</span>
                            <span>{{ $t('data.designer.oneOffSale') }}</span>
                        </div>
                        <div class="flex gap-2 flex-col">
                            <span class="text-sm font-semibold text-gray-400">{{
                                $t('data.designer.oneOffPrice')
                            }}</span>
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
                                    ?.title
                            }}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('termsConditions') }}</span>
                        <span>{{ oneOffSaleDetails.terms }}</span>
                    </div>
                </div>
                <div v-if="monetizationSelection === MonetMethod.SUBSCRIPTION" class="flex flex-col gap-8">
                    <div class="flex items-start gap-8">
                        <div class="flex gap-2 flex-col">
                            <span class="text-sm font-semibold text-gray-400">{{
                                $t('data.designer.monetizationMethod')
                            }}</span>
                            <span>{{ $t('data.designer.subscription') }}</span>
                        </div>
                        <div class="flex gap-2 flex-col">
                            <span class="text-sm font-semibold text-gray-400">{{
                                $t('data.designer.subscriptionPrice') +
                                ' & ' +
                                $t('data.designer.subscriptionFrequency')
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
                                limitFrequencySelections.find(
                                    (item) => item.value === subscriptionDetails.limitFrequency,
                                )?.title
                            }}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('termsConditions') }}</span>
                        <span>{{ subscriptionDetails.terms }}</span>
                    </div>
                </div>
                <div class="w-full flex justify-between items-center mt-8">
                    <UButton size="md" color="gray" variant="outline" @click="handleStepSelect('editor')">
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
