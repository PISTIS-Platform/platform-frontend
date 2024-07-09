<script setup lang="ts">
import { DatasetKind } from '~/interfaces/dataset.enum';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';

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

const monetizationSelection = ref<string>('one-off');

const monetizationDetails = ref<OneOffSaleDetails | SubscriptionDetails | NFTDetails | InvestmentPlanDetails>();

// validation data
const isAssetOfferingDetailsValid = ref<boolean>(false);
const isMonetizationValid = ref<boolean>(false);

const isAllValid = computed(() => isAssetOfferingDetailsValid.value && isMonetizationValid.value);

const submitAll = () => {
    let objToSend;
    //TODO: Figure out final form for each monetization method

    //TODO: Send final object / JSON to API (blockchain)
    return objToSend;
};

const limitFrequencySelections = computed(() => [
    { title: t('perHour'), value: DownloadFrequency.HOUR },
    { title: t('perDay'), value: DownloadFrequency.DAY },
    { title: t('perWeek'), value: DownloadFrequency.WEEK },
    { title: t('perMonth'), value: DownloadFrequency.MONTH },
    { title: t('perYear'), value: DownloadFrequency.YEAR },
]);

const steps = [
    { id: '1', name: t('data.designer.nav.selectDataset'), href: 'select', status: 'current' },
    { id: '2', name: t('data.designer.nav.monetizationPlanner'), href: 'planner', status: 'upcoming' },
    { id: '3', name: t('data.designer.nav.accessPoliciesEditor'), href: 'editor', status: 'upcoming' },
    { id: '4', name: t('data.designer.nav.preview'), href: 'preview', status: 'upcoming' },
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
    <nav aria-label="Progress">
        <ol role="list" class="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0 mb-8">
            <li
                v-for="(step, stepIdx) in steps"
                :key="step.name"
                class="relative md:flex md:flex-1 cursor-pointer"
                @click="handleStepSelect(step.href)"
            >
                <a v-if="step.status === 'complete'" class="group flex w-full items-center">
                    <span class="flex items-center px-6 py-4 text-sm font-medium">
                        <span
                            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white group-hover:bg-indigo-800"
                        >
                            <UIcon name="i-fa6-regular-circle-check" class="text-white h-5 w-5" />
                        </span>
                        <span class="ml-4 text-sm font-medium text-gray-900">{{ step.name }}</span>
                    </span>
                </a>
                <a
                    v-else-if="step.status === 'current'"
                    class="flex items-center px-6 py-4 text-sm font-medium"
                    aria-current="step"
                >
                    <span
                        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600"
                    >
                        <span class="text-indigo-600">{{ step.id }}</span>
                    </span>
                    <span class="ml-4 text-sm font-medium text-indigo-600">{{ step.name }}</span>
                </a>
                <a v-else class="group flex items-center">
                    <span class="flex items-center px-6 py-4 text-sm font-medium">
                        <span
                            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400"
                        >
                            <span class="text-gray-500 group-hover:text-gray-900">{{ step.id }}</span>
                        </span>
                        <span class="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">{{
                            step.name
                        }}</span>
                    </span>
                </a>
                <template v-if="stepIdx !== steps.length - 1">
                    <!-- Arrow separator for lg screens and up -->
                    <div class="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                        <svg
                            class="h-full w-full text-gray-300"
                            viewBox="0 0 22 80"
                            fill="none"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0 -2L20 40L0 82"
                                vector-effect="non-scaling-stroke"
                                stroke="currentcolor"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </div>
                </template>
            </li>
        </ol>
    </nav>

    <div v-show="selectedPage === 'select'" class="w-full h-full text-gray-700 space-y-8">
        <UCard v-for="dataset in dataSets" :key="dataset.id">
            <template #header>
                <div class="flex items-center w-full justify-between">
                    <span class="font-bold">{{ dataset.title }}</span>
                    <UButton @click="handleDatasetSelection(dataset)">{{ $t('select') }}</UButton>
                </div>
            </template>
            <p>
                {{ dataset.description }}
            </p>
        </UCard>
    </div>

    <div v-show="selectedPage === 'planner'" class="w-full h-full text-gray-700 space-y-8">
        <DatasetSelector
            v-if="selected"
            :selected="selected"
            :complete-or-query="completeOrQuery"
            @update:complete-or-query="(value: string) => (completeOrQuery = value)"
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
            :is-all-valid="isAllValid"
            :monetization-selection="monetizationSelection"
            @update:monetization-selection="(value: string) => (monetizationSelection = value)"
            @update:monetization-details="(value: typeof monetizationDetails) => (monetizationDetails = value)"
            @is-monetization-valid="(value: boolean) => (isMonetizationValid = value)"
            @change-page="handleStepSelect"
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
                <div v-if="monetizationSelection === 'one-off'" class="flex flex-col gap-8">
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
                            <span>{{ monetizationDetails.price + ' STC' || $t('data.designer.free') }}</span>
                        </div>
                        <div class="flex gap-2 flex-col">
                            <span class="text-sm font-semibold text-gray-400">{{ $t('license') }}</span>
                            <span>{{ monetizationDetails.license }}</span>
                        </div>
                        <div class="flex gap-2 flex-col">
                            <span class="text-sm font-semibold text-gray-400">{{
                                $t('data.designer.downloadLimit') + ' & ' + $t('frequency')
                            }}</span>
                            <span>{{
                                monetizationDetails.limitNumber +
                                ' ' +
                                $t('times') +
                                ' ' +
                                limitFrequencySelections.find(
                                    (item) => item.value === monetizationDetails.limitFrequency,
                                )?.title
                            }}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('termsConditions') }}</span>
                        <span>{{ monetizationDetails.terms }}</span>
                    </div>
                </div>
                <div v-if="monetizationSelection === 'subscription'" class="flex flex-col gap-8">
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
                                monetizationDetails.price
                                    ? monetizationDetails.price +
                                      ' STC ' +
                                      (monetizationDetails.frequency === 'annual'
                                          ? $t('data.designer.annual')
                                          : $t('data.designer.monthly'))
                                    : $t('data.designer.free') +
                                      ' - ' +
                                      (monetizationDetails.frequency === 'annual'
                                          ? $t('data.designer.annual')
                                          : $t('data.designer.monthly'))
                            }}</span>
                        </div>
                        <div class="flex gap-2 flex-col">
                            <span class="text-sm font-semibold text-gray-400">{{ $t('license') }}</span>
                            <span>{{ monetizationDetails.license }}</span>
                        </div>
                        <div class="flex gap-2 flex-col">
                            <span class="text-sm font-semibold text-gray-400">{{
                                $t('data.designer.downloadLimit') + ' & ' + $t('frequency')
                            }}</span>
                            <span>{{
                                monetizationDetails.limitNumber +
                                ' ' +
                                $t('times') +
                                ' ' +
                                limitFrequencySelections.find(
                                    (item) => item.value === monetizationDetails.limitFrequency,
                                )?.title
                            }}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('termsConditions') }}</span>
                        <span>{{ monetizationDetails.terms }}</span>
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
