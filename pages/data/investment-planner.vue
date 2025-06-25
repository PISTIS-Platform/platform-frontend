<script setup lang="ts">
const { t } = useI18n();
import dayjs from 'dayjs';
import { z } from 'zod';

const monetizationDetails = ref({
    validOfferDate: '',
    percentageToOfferSharesFor: '',
    numberOfShares: '',
    sharePrice: '',
    maximumSharesToBuy: '',
    termsAndConditions: '',
});

//FIXME: Create separate validations for each step/form to make sure user sees errors that exist

const monetizationSchema = z
    .object({
        validOfferDate: z.string().min(1, t('required')),
        percentageToOfferSharesFor: z.coerce
            .number()
            .min(10, t('data.investmentPlanner.errors.percentageMin'))
            .max(49, t('data.investmentPlanner.errors.percentageMax')),
        numberOfShares: z.coerce
            .number()
            .int(t('data.investmentPlanner.errors.sharesInt'))
            .min(10, t('data.investmentPlanner.errors.sharesMin'))
            .max(1000, t('data.investmentPlanner.errors.sharesMax'))
            .refine((val) => val !== null && val !== undefined, {
                message: t('required'),
            }),
        sharePrice: z.coerce
            .number()
            .int(t('data.investmentPlanner.errors.sharePriceInt'))
            .min(1, t('data.investmentPlanner.errors.sharePriceMin'))
            .refine((val) => val !== null && val !== undefined, { message: t('required') }),
        maximumSharesToBuy: z.coerce
            .number()
            .int(t('data.investmentPlanner.errors.maxSharesInt'))
            .min(1, t('data.investmentPlanner.errors.maxSharesMin'))
            .refine((val) => val !== null && val !== undefined, { message: t('required') }),
        termsAndConditions: z
            .string()
            .min(10, t('data.investmentPlanner.errors.termsMin'))
            .max(10000, t('data.investmentPlanner.errors.termsMax')),
    })
    .superRefine((data, ctx) => {
        if (data.maximumSharesToBuy > data.numberOfShares) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('data.investmentPlanner.errors.maxSharesExceed'),
                path: ['maximumSharesToBuy'],
            });
        }
    });

const isMonetizationValid = computed(() => monetizationSchema.safeParse(monetizationDetails.value).success);

const percentageOfShare = computed(() => {
    if (!monetizationDetails.value.percentageToOfferSharesFor || !monetizationDetails.value.numberOfShares) {
        return null;
    }
    return Number(
        (monetizationDetails.value.percentageToOfferSharesFor / monetizationDetails.value.numberOfShares).toFixed(3),
    );
});

const assetOfferingDetails = ref({
    title: '',
    description: '',
    keywords: [],
});

const selected = ref<
    { id: string | number; title: string; description: string; distributions: Record<string, any>[] } | undefined
>(undefined);

watch(selected, () => {
    if (!selected.value) return;
    assetOfferingDetails.value.title = selected.value.title;
    assetOfferingDetails.value.description = selected.value.description;
});

//TODO: Display alert with error
const {
    data: datasetsData,
    status: datasetsStatus,
    error: _datasetsError,
} = useFetch(`/api/datasets/get-all`, {
    server: false,
    async onResponse({ response }) {
        console.log({ response });
    },
});

const transformedDatasets = computed(() => {
    if (!datasetsData.value || !datasetsData.value.length) {
        return [];
    }
    return datasetsData.value.map((dataset: Record<string, any>) => ({
        id: dataset.id,
        title: dataset.title.en,
        description: dataset.description.en,
        distributions: dataset.distributions,
    }));
});

const steps = computed(() => [
    { name: t('data.investmentPlanner.steps.selectDataset'), isActive: true },
    {
        name: t('data.investmentPlanner.steps.investmentPlanner'),
        isActive: selected.value && isAssetOfferingDetailsValid.value,
    },
    {
        name: t('data.investmentPlanner.steps.accessPoliciesEditor'),
        isActive: isMonetizationValid.value,
    },
    {
        name: t('data.investmentPlanner.steps.preview'),
        isActive: isMonetizationValid.value,
    },
]);

const changeStep = async (stepNum: number) => {
    selectedPage.value = stepNum;
};

const selectedPage = ref(0);
const assetOfferingsSchema = z.object({
    title: z.string().min(1, t('required', { count: 1 })),
    description: z.string().min(1, t('required', { count: 1 })),
    keywords: z
        .string()
        .array()
        .min(1, t('required', { count: 1 })),
});

const isAssetOfferingDetailsValid = computed(() => assetOfferingsSchema.safeParse(assetOfferingDetails.value).success);

//Policy Data
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
</script>

<template>
    <UProgress v-if="datasetsStatus === 'pending'" animation="carousel" />
    <div v-else class="w-full text-gray-700 h-full relative">
        <NavigationSteps :steps="steps" :selected-page="selectedPage" @select-page="changeStep" />
        <UCard v-show="selectedPage === 0">
            <template #header>
                <div class="flex items-center gap-4">
                    <UIcon name="oui:pages-select" class="w-10 h-10 text-gray-500" />
                    <SubHeading
                        :title="$t('data.investmentPlanner.datasetSelectorTitle')"
                        :info="$t('data.investmentPlanner.datasetSelectorInfo')"
                    />
                </div>
            </template>
            <USelectMenu
                v-model="selected"
                searchable
                :options="transformedDatasets"
                option-attribute="title"
                :placeholder="$t('data.investmentPlanner.datasetSelectorPlaceholder')"
            />
        </UCard>
        <InvestmentAssetOffering
            v-show="selectedPage === 0"
            :asset-details-prop="assetOfferingDetails"
            class="mt-6"
            @update:asset-keywords="(value: string[]) => (assetOfferingDetails.keywords = value)"
        />
        <UCard v-show="selectedPage === 1">
            <template #header>
                <div class="flex items-center gap-4">
                    <UIcon name="streamline:investment-selection" class="w-10 h-10 text-gray-500" />
                    <SubHeading :title="$t('data.investmentPlanner.title')" :info="$t('data.investmentPlanner.info')" />
                </div>
            </template>
            <UForm :schema="monetizationSchema" :state="monetizationDetails" class="flex flex-col space-y-5">
                <div class="flex flex-row gap-4">
                    <div class="flex flex-col gap-6 w-full">
                        <div class="flex-1 flex gap-4">
                            <div class="flex-1 flex gap-4">
                                <UFormGroup
                                    :label="$t('data.investmentPlanner.validOfferDate')"
                                    name="validOfferDate"
                                    class="text-gray-200 flex-1"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    eager-validation
                                    required
                                >
                                    <UPopover :popper="{ placement: 'bottom-start' }">
                                        <UButton
                                            color="white"
                                            icon="i-heroicons-calendar-days-20-solid"
                                            :label="
                                                monetizationDetails.validOfferDate
                                                    ? dayjs(monetizationDetails.validOfferDate).format('DD MMMM YYYY')
                                                    : $t('data.investmentPlanner.validOfferDatePlaceholder')
                                            "
                                            :class="[
                                                'w-full',
                                                monetizationDetails.validOfferDate
                                                    ? 'text-gray-700'
                                                    : 'text-gray-400 font-normal',
                                            ]"
                                        />
                                        <template #panel="{ close }">
                                            <DatePicker
                                                v-model="monetizationDetails.validOfferDate"
                                                is-required
                                                @close="close"
                                            />
                                        </template>
                                    </UPopover>
                                </UFormGroup>
                                <UFormGroup
                                    :label="$t('data.investmentPlanner.percentageToOfferSharesFor')"
                                    class="flex-1"
                                    name="percentageToSell"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    required
                                    eager-validation
                                >
                                    <UInput
                                        v-model.number="monetizationDetails.percentageToOfferSharesFor"
                                        :placeholder="$t('data.investmentPlanner.percentageOfOwnership')"
                                        type="numeric"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">%</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                            </div>
                        </div>
                        <div class="flex-1 flex gap-4">
                            <UFormGroup
                                :label="$t('data.investmentPlanner.numberOfShares')"
                                class="flex-1"
                                required
                                name="percentageMinimum"
                                :ui="{ error: 'absolute -bottom-6' }"
                                eager-validation
                            >
                                <UInput
                                    v-model.number="monetizationDetails.numberOfShares"
                                    :placeholder="$t('data.investmentPlanner.numberOfSharesPlaceholder')"
                                    type="numeric"
                                >
                                    <template #trailing>
                                        <span class="text-gray-500 text-xs">shares</span>
                                    </template>
                                </UInput>
                            </UFormGroup>
                            <UFormGroup
                                :label="$t('data.investmentPlanner.sharePrice')"
                                class="flex-1"
                                name="percentagePrice"
                                :ui="{ error: 'absolute -bottom-6' }"
                                required
                                eager-validation
                            >
                                <UInput
                                    v-model.number="monetizationDetails.sharePrice"
                                    :placeholder="$t('data.investmentPlanner.sharePricePlaceholder')"
                                    type="numeric"
                                >
                                    <template #trailing>
                                        <span class="text-gray-500 text-xs">EUR</span>
                                    </template>
                                </UInput>
                            </UFormGroup>
                        </div>
                        <div class="flex-1 flex gap-4 items-center">
                            <UFormGroup
                                :label="$t('data.investmentPlanner.maximumSharesToBuy')"
                                class="flex-1"
                                required
                                name="percentageMinimum"
                                :ui="{ error: 'absolute -bottom-6' }"
                                eager-validation
                            >
                                <UInput
                                    v-model.number="monetizationDetails.maximumSharesToBuy"
                                    :placeholder="$t('data.investmentPlanner.maximumSharesToBuyPlaceholder')"
                                    type="numeric"
                                >
                                    <template #trailing>
                                        <span class="text-gray-500 text-xs">shares</span>
                                    </template>
                                </UInput>
                            </UFormGroup>
                            <div class="flex-1 text-[13px] mt-5">
                                You are offering
                                <span class="font-bold"
                                    >{{ monetizationDetails.percentageToOfferSharesFor || '__' }}%</span
                                >
                                in
                                <span class="font-bold">{{ monetizationDetails.numberOfShares || '__' }} shares</span>.
                                Each share is <span class="font-bold">{{ percentageOfShare || '__' }}% </span>of the
                                total priced at
                                <span class="font-bold">{{ monetizationDetails.sharePrice || '__' }} EUR</span>.<br />
                                The maximum shares a user can buy is
                                <span class="font-bold"
                                    >{{ monetizationDetails.maximumSharesToBuy || '__' }} shares</span
                                >. The offer is valid until
                                <span class="font-bold">{{
                                    monetizationDetails.validOfferDate
                                        ? dayjs(monetizationDetails.validOfferDate).format('DD/MM/YY')
                                        : '__'
                                }}</span
                                >.
                            </div>
                        </div>
                        <div class="flex flex-col w-full">
                            <UFormGroup :label="$t('data.investmentPlanner.termsAndConditions')" eager-validation>
                                <UTextarea
                                    v-model="monetizationDetails.termsAndConditions"
                                    :placeholder="$t('data.investmentPlanner.termsAndConditions')"
                                />
                            </UFormGroup>
                        </div>
                    </div>
                </div>
            </UForm>
        </UCard>
        <div v-show="selectedPage === 2" class="w-full">
            <AccessPolicyList
                v-model:policy-data="policyData"
                :selected="selected"
                hide-buttons
                @update:policy-data="(value: AccessPolicyDetails[]) => (policyData = value)"
            />
        </div>
        <div v-show="selectedPage === 3" class="w-full">
            <UCard>
                <template #header>
                    <div class="flex items-center gap-4">
                        <UIcon name="tabler:list-details" class="w-10 h-10 text-gray-500" />
                        <SubHeading
                            :title="$t('data.designer.assetOfferingDetails')"
                            :info="$t('data.designer.assetOfferingDetailsInfo')"
                        />
                    </div>
                </template>
                <div>
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
                </div>
            </UCard>
            <UCard class="mt-6 mb-6">
                <template #header>
                    <div class="flex items-center gap-4">
                        <UIcon name="streamline:investment-selection" class="w-10 h-10 text-gray-500" />
                        <SubHeading
                            :title="$t('data.investmentPlanner.title')"
                            :info="$t('data.investmentPlanner.info')"
                        />
                    </div>
                </template>
                <div class="flex flex-col gap-8">
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.investmentPlanner.validOfferDate')
                        }}</span>
                        <span>{{ dayjs(monetizationDetails.validOfferDate).format('DD MMMM YYYY') }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.investmentPlanner.percentageToOfferSharesFor')
                        }}</span>
                        <span>{{ monetizationDetails.percentageToOfferSharesFor }}%</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.investmentPlanner.numberOfShares')
                        }}</span>
                        <span>{{ monetizationDetails.numberOfShares }} shares</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.investmentPlanner.sharePrice')
                        }}</span>
                        <span>{{ monetizationDetails.sharePrice }} EUR</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.investmentPlanner.maximumSharesToBuy')
                        }}</span>
                        <span>{{ monetizationDetails.maximumSharesToBuy }} shares</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.investmentPlanner.termsAndConditions')
                        }}</span>
                        <p>{{ monetizationDetails.termsAndConditions }}</p>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.investmentPlanner.summary')
                        }}</span>
                        <div class="flex-1">
                            You are offering
                            <span class="font-bold">{{ monetizationDetails.percentageToOfferSharesFor || '__' }}%</span>
                            in
                            <span class="font-bold">{{ monetizationDetails.numberOfShares || '__' }} shares</span>. Each
                            share is <span class="font-bold">{{ percentageOfShare || '__' }}% </span>of the total priced
                            at <span class="font-bold">{{ monetizationDetails.sharePrice || '__' }} EUR</span>.<br />
                            The maximum shares a user can buy is
                            <span class="font-bold">{{ monetizationDetails.maximumSharesToBuy || '__' }} shares</span>.
                            The offer is valid until
                            <span class="font-bold">{{
                                monetizationDetails.validOfferDate
                                    ? dayjs(monetizationDetails.validOfferDate).format('DD/MM/YY')
                                    : '__'
                            }}</span
                            >.
                        </div>
                    </div>
                </div>
            </UCard>
            <AccessPolicyList preview :policy-data="policyData" />
        </div>
    </div>
    <div v-if="datasetsStatus !== 'pending'" class="relative w-full items-center justify-between flex mt-6">
        <UButton color="white" size="lg" :disabled="selectedPage === 0" @click="changeStep(selectedPage - 1)"
            >Previous</UButton
        >
        <UButton
            v-if="selectedPage !== 3"
            size="lg"
            :disabled="!steps[selectedPage + 1]?.isActive"
            @click="changeStep(selectedPage + 1)"
            >Next</UButton
        >
        <UButton
            v-if="selectedPage === 3"
            size="lg"
            :disabled="!steps[selectedPage + 1]?.isActive"
            @click="changeStep(selectedPage + 1)"
            >Submit</UButton
        >
    </div>
</template>
