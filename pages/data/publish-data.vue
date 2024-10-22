<script setup lang="ts">
import { v4 as uuidV4 } from 'uuid';
import { z } from 'zod';

import { DatasetKind } from '~/interfaces/dataset.enum';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';
import type { AccessPolicyDetails, AssetOfferingDetails } from '~/interfaces/plan-designer';

const runtimeConfig = useRuntimeConfig();

const { data: session } = useAuth();
const { showSuccessMessage } = useAlertMessage();
const router = useRouter();
const { t } = useI18n();
const submitError = ref(false);

//data for selected dataset

//TODO: Get ID and data to pass down to DatasetSelector from API call
const selected = ref<
    { id: string | number; title: string; description: string; distributions: Record<string, any>[] } | undefined
>(undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: allDatasets, status: datasetsStatus } = useAsyncData<Record<string, any>>(() =>
    $fetch('/api/datasets/get-all'),
);

const datasetsTransformed = computed(() => {
    if (!allDatasets.value?.length) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allDatasets.value.map((result: Record<string, any>) => ({
        id: result.id,
        title: result.title.en,
        description: result.description.en,
        distributions: result.distributions,
    }));
});

//data for selection whole dataset or query

const completeOrQuery = ref<string>(DatasetKind.COMPLETE);
const newAssetId = uuidV4();

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
    distributions: undefined,
    selectedDistribution: undefined,
    keywords: [],
});

const assetOfferingDetailsSchema = z.object({
    title: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    description: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
    selectedDistribution: z.object({
        id: z.string(),
        format: z.object({
            id: z.string(),
            label: z.string(),
            resource: z.string(),
        }),
        access_url: z.array(z.string()),
        title: z.object({
            en: z.string(),
        }),
    }),
});

const isAssetOfferingDetailsValid = computed(
    () =>
        assetOfferingDetailsSchema.safeParse(assetOfferingDetails.value).success &&
        assetOfferingDetails.value.keywords.length > 0,
);

// data for monetization selections

const { isFree, isWorldwide, isPerpetual, hasPersonalData, monetizationSchema } = useMonetizationSchema();

type monetizationType = z.infer<typeof monetizationSchema>;

const monetizationDetails = ref<Partial<monetizationType>>({
    type: 'one-off',
    price: undefined,
    license: 'PISTIS License',
    extraTerms: '',
    contractTerms: '',
    limitNumber: undefined,
    limitFrequency: '',
});

const isMonetizationValid = computed(() => monetizationSchema.safeParse(monetizationDetails.value).success);

// access policies
const policyData: Array<AccessPolicyDetails> = [];
const defaultPolicy: AccessPolicyDetails = {
    countries: [],
    domains: [],
    groups: [],
    scopes: [],
    sizes: [],
    types: [],
    id: t('policies.publicationDefaults.id'),
    title: t('policies.publicationDefaults.title'),
    description: t('policies.publicationDefaults.description'),
    default: true,
};
policyData.push(defaultPolicy);

// validation data
const isAllValid = computed(() => isAssetOfferingDetailsValid.value && isMonetizationValid.value);

const submitAll = async () => {
    let body = {
        originalAssetId: selected.value?.id,
        organizationId: runtimeConfig.public?.orgId,
        ...assetOfferingDetails.value,
        ...monetizationDetails.value,
        assetId: newAssetId,
        accessPolicies: {
            assetId: newAssetId,
            assetTitle: assetOfferingDetails.value.title,
            assetDescription: assetOfferingDetails.value.description,
            policyData: policyData,
        },
        sellerId: session.value?.user?.sub,
        numOfResell: 0,
        numOfShare: 0,
    };
    console.log(body);
    try {
        await $fetch(`/api/datasets/publish-data`, {
            method: 'post',
            body,
        });
        showSuccessMessage(t('data.designer.assetSubmitted'));
        router.push({ name: 'home' });
        await navigateTo(`${runtimeConfig.public.marketplaceDatasetUrl}/${newAssetId}?locale=en`, {
            open: {
                target: '_blank',
            },
            external: true,
        });
    } catch (error) {
        submitError.value = true;
    }

    return body;
};

const limitFrequencySelections = computed(() => [
    { title: t('perHour'), value: DownloadFrequency.HOUR },
    { title: t('perDay'), value: DownloadFrequency.DAY },
    { title: t('perWeek'), value: DownloadFrequency.WEEK },
    { title: t('perMonth'), value: DownloadFrequency.MONTH },
    { title: t('perYear'), value: DownloadFrequency.YEAR },
]);

const steps = computed(() => [
    { name: t('data.designer.nav.selectDataset'), isActive: true },
    { name: t('data.designer.nav.monetizationPlanner'), isActive: selected.value },
    { name: t('data.designer.nav.accessPoliciesEditor'), isActive: selected.value && isAllValid.value },
    //TODO: Add extra check for completed access policies info
    { name: t('data.designer.nav.preview'), isActive: selected.value && isAllValid.value },
]);

const selectedPage = ref(0);

const handleDatasetSelection = (dataset: {
    id: string | number;
    title: string;
    description: string;
    distributions: Record<string, any>[];
}) => {
    selected.value = dataset;
    assetOfferingDetails.value.title = selected?.value.title;
    assetOfferingDetails.value.description = selected?.value.description;
    assetOfferingDetails.value.distributions = selected?.value.distributions.map((item) => ({
        ...item,
        label: `${item.format.label} - ${item.title.en}`,
    }));
    assetOfferingDetails.value.selectedDistribution = assetOfferingDetails.value.distributions[0];
    selectedPage.value = 1;
};

const handlePageSelectionBackwards = (value: number) => {
    selectedPage.value = value;
    submitError.value = false;
};

const changeStep = async (stepNum: number) => {
    if (stepNum === 3) {
        //api call to contract template composer
        const _data = await $fetch(`/api/datasets/get-composed-contract`, {
            method: 'post',
            body: {
                assetId: newAssetId,
                organizationId: runtimeConfig.public?.orgId,
                terms: monetizationDetails.value.contractTerms,
                monetisationMethod: monetizationDetails.value.type,
                price: monetizationDetails.value.price,
                limitNumber: monetizationDetails.value.limitNumber,
                limitFrequency: monetizationDetails.value.limitFrequency,
                subscriptionFrequency:
                    monetizationDetails.value.type === 'subscription'
                        ? monetizationDetails.value.subscriptionFrequency
                        : null,
            },
        });
        //TODO:: use returned compose contract for other pistis components
    }
};
</script>

<template>
    <nav aria-label="Progress">
        <ol role="list" class="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0 mb-8">
            <li
                v-for="(step, stepIdx) in steps"
                :key="step.name"
                class="relative md:flex md:flex-1 cursor-pointer"
                :class="step.isActive ? '' : 'pointer-events-none'"
                @click="selectedPage = stepIdx"
            >
                <a v-if="selectedPage > stepIdx" class="group flex w-full items-center">
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
                    v-else-if="selectedPage === stepIdx"
                    class="flex items-center px-6 py-4 text-sm font-medium"
                    aria-current="step"
                >
                    <span
                        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600"
                    >
                        <span class="text-indigo-600">{{ stepIdx + 1 }}</span>
                    </span>
                    <span class="ml-4 text-sm font-medium text-indigo-600">{{ step.name }}</span>
                </a>
                <a v-else class="group flex items-center" @click="changeStep(stepIdx)">
                    <span class="flex items-center px-6 py-4 text-sm font-medium">
                        <span
                            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400"
                        >
                            <span class="text-gray-500 group-hover:text-gray-900">{{ stepIdx + 1 }}</span>
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
    <UProgress v-if="datasetsStatus === 'pending'" animation="carousel" />

    <div class="w-full mb-6">
        <UAlert
            v-if="submitError"
            icon="mingcute:alert-line"
            color="red"
            variant="subtle"
            :description="$t('data.designer.errorInSubmitAsset')"
        />
    </div>

    <div v-show="selectedPage === 0 && datasetsStatus !== 'pending'" class="w-full h-full text-gray-700 space-y-8">
        <UCard v-for="dataset in datasetsTransformed" :key="dataset.id">
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

    <div v-show="selectedPage === 1" class="w-full h-full text-gray-700 space-y-8">
        <DatasetSelector
            v-if="selected"
            :selected="selected"
            :complete-or-query="completeOrQuery"
            @update:complete-or-query="(value: string) => (completeOrQuery = value)"
        />

        <AssetOfferingDetails
            v-model:asset-details-prop="assetOfferingDetails"
            @update:asset-keywords="(value: string[]) => (assetOfferingDetails.keywords = value)"
        />

        <FairSuggestions v-model="fairValuationInfo" :loading-valuation="loadingValuation" />

        <MonetizationMethod
            v-model:monetization-details-prop="monetizationDetails"
            :asset-offering-details="assetOfferingDetails"
            :is-all-valid="isAllValid"
            @change-page="(value: number) => (selectedPage = value)"
            @update:is-free="(value: boolean) => (isFree = value)"
            @update:is-worldwide="(value: boolean) => (isWorldwide = value)"
            @update:is-perpetual="(value: boolean) => (isPerpetual = value)"
            @update:has-personal-data="(value: boolean) => (hasPersonalData = value)"
        />
    </div>

    <template v-if="selected">
        <div v-show="selectedPage === 2" class="w-full h-full text-gray-700 space-y-8">
            <AccessPolicyList
                v-model:policy-data="policyData"
                :selected="selected"
                @change-page="(value: number) => (selectedPage = value)"
                @update:policy-data="(value: AccessPolicyDetails[]) => (policyData = value)"
            />
        </div>
    </template>

    <div v-if="isAllValid">
        <div v-show="selectedPage === 3" class="w-full h-full text-gray-700 space-y-8">
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
                <div v-if="monetizationDetails.type === 'one-off'" class="flex flex-col gap-8">
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
                            <span>{{
                                monetizationDetails.price
                                    ? monetizationDetails.price + ' PST'
                                    : $t('data.designer.free')
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
                        <span>{{ monetizationDetails.extraTerms }}</span>
                    </div>
                </div>
                <div v-if="monetizationDetails.type === 'subscription'" class="flex flex-col gap-8">
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
                                      ' PST ' +
                                      (monetizationDetails.subscriptionFrequency === 'annual'
                                          ? $t('data.designer.annual')
                                          : $t('data.designer.monthly'))
                                    : $t('data.designer.free') +
                                      ' - ' +
                                      (monetizationDetails.subscriptionFrequency === 'annual'
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
                        <span>{{ monetizationDetails.extraTerms }}</span>
                    </div>
                </div>
                <div class="w-full flex justify-between items-center mt-8">
                    <UButton size="md" color="gray" variant="outline" @click="handlePageSelectionBackwards(2)">
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
