<script setup lang="ts">
const { t } = useI18n();
import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';
import { z } from 'zod';

const {
    public: { cloudUrl },
} = useRuntimeConfig();

import type { AccessPolicyDetails } from '~/interfaces/plan-designer';

const { showErrorMessage, showSuccessMessage } = useAlertMessage();
import { navigateTo } from '#app';

const monetizationDetails = ref({
    validOfferDate: undefined,
    percentageToOfferSharesFor: undefined,
    numberOfShares: undefined,
    sharePrice: undefined,
    maximumSharesToBuy: undefined,
    termsAndConditions: undefined,
});

const allBasicFieldsFilledIn = computed(
    () =>
        monetizationDetails.value.validOfferDate &&
        monetizationDetails.value.percentageToOfferSharesFor &&
        monetizationDetails.value.numberOfShares &&
        monetizationDetails.value.sharePrice &&
        monetizationDetails.value.maximumSharesToBuy,
);

const monetizationSchema = z
    .object({
        validOfferDate: z.string().min(1, t('required')),
        percentageToOfferSharesFor: z.coerce
            .number({ invalid_type_error: t('data.investmentPlanner.errors.number') })
            .min(10, t('data.investmentPlanner.errors.percentageMin'))
            .max(49, t('data.investmentPlanner.errors.percentageMax')),
        numberOfShares: z.coerce
            .number({ invalid_type_error: t('data.investmentPlanner.errors.number') })
            .int(t('data.investmentPlanner.errors.sharesInt'))
            .min(10, t('data.investmentPlanner.errors.sharesMin'))
            .max(1000, t('data.investmentPlanner.errors.sharesMax'))
            .refine((val) => val !== null && val !== undefined, {
                message: t('required'),
            }),
        sharePrice: z.coerce
            .number({ invalid_type_error: t('data.investmentPlanner.errors.number') })
            .int(t('data.investmentPlanner.errors.sharePriceInt'))
            .min(1, t('data.investmentPlanner.errors.sharePriceMin'))
            .refine((val) => val !== null && val !== undefined, { message: t('required') }),
        maximumSharesToBuy: z.coerce
            .number({ invalid_type_error: t('data.investmentPlanner.errors.number') })
            .int(t('data.investmentPlanner.errors.maxSharesInt'))
            .min(1, t('data.investmentPlanner.errors.maxSharesMin')),
        termsAndConditions: z
            .string()
            .min(10, t('data.investmentPlanner.errors.termsMin'))
            .max(10000, t('data.investmentPlanner.errors.termsMax'))
            .refine((val) => val !== null && val !== undefined, { message: t('required') }),
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

const customValidate = () => {
    const errors = [];
    const totalErrors = monetizationSchema.safeParse(monetizationDetails.value).error?.issues;
    if (totalErrors?.length) {
        for (const error of totalErrors) {
            errors.push({ path: error.path[0], message: error.message });
        }
    }
    if (monetizationDetails.value.maximumSharesToBuy >= monetizationDetails.value.numberOfShares) {
        errors.push({ path: 'maximumSharesToBuy', message: t('data.investmentPlanner.errors.maxSharesExceed') });
    }
    return errors;
};

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
    id: '',
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
    assetOfferingDetails.value.id = selected.value.id;
});

//FIXME: Get available datasets (one-off and subscription) from marketplace, not local catalog
const {
    data: datasetsData,
    status: datasetsStatus,
    error: datasetsError,
} = useFetch(`/api/datasets/get-all`, {
    server: false,
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

const onInvestmentSubmit = () => {
    changeStep(2);
};

const submitAll = async () => {
    const objToSend: {
        type: string;
        cloudAssetId: string;
        assetId: string;
        dueDate: string;
        percentageOffer: number;
        totalShares: number;
        maxShares: number;
        price: number;
        status: boolean;
        terms: string;
        title: string;
        description: string;
        keywords: string[];
        accessPolicy: AccessPolicyDetails[];
    } = {
        type: 'investment',
        cloudAssetId: uuidV4(),
        assetId: assetOfferingDetails.value.id,
        dueDate: monetizationDetails.value.validOfferDate,
        percentageOffer: monetizationDetails.value.percentageToOfferSharesFor,
        totalShares: monetizationDetails.value.numberOfShares,
        maxShares: monetizationDetails.value.maximumSharesToBuy,
        price: monetizationDetails.value.sharePrice,
        status: true,
        terms: monetizationDetails.value.termsAndConditions,
        title: assetOfferingDetails.value.title,
        description: assetOfferingDetails.value.description,
        keywords: assetOfferingDetails.value.keywords,
        accessPolicy: policyData,
    };

    try {
        await $fetch(`/api/investment/submit-investment`, {
            method: 'POST',
            body: objToSend,
        });
        showSuccessMessage(t('data.investmentPlanner.success'));
        await delay(2);
        navigateTo(`${cloudUrl}/srv/catalog/datasets/${objToSend.assetId}?locale=en`, { external: true });
    } catch {
        showErrorMessage(t('data.investmentPlanner.errors.couldNotCreateInvestmentPlan'));
    }
};
</script>

<template>
    <UProgress v-if="datasetsStatus === 'pending'" animation="carousel" />
    <UAlert
        v-else-if="datasetsError"
        variant="subtle"
        :title="t('data.investmentPlanner.errors.couldNotRetrieveDatasets')"
        color="red"
    />
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
            v-show="selectedPage === 0 && selected"
            :asset-details-prop="assetOfferingDetails"
            class="mt-6"
            @update:asset-keywords="(value: string[]) => (assetOfferingDetails.keywords = value)"
            @change-page="changeStep(1)"
        />

        <UForm
            :schema="monetizationSchema"
            :state="monetizationDetails"
            :validate="customValidate"
            class="flex flex-col space-y-5"
            @submit="onInvestmentSubmit"
        >
            <UCard v-show="selectedPage === 1">
                <template #header>
                    <div class="flex items-center gap-4">
                        <UIcon name="streamline:investment-selection" class="w-10 h-10 text-gray-500" />
                        <SubHeading
                            :title="$t('data.investmentPlanner.title')"
                            :info="$t('data.investmentPlanner.info')"
                        />
                    </div>
                </template>
                <div class="flex flex-col space-y-5">
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
                                                        ? dayjs(monetizationDetails.validOfferDate).format(
                                                              'DD MMMM YYYY',
                                                          )
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
                                        name="percentageToOfferSharesFor"
                                        :ui="{ error: 'absolute -bottom-6' }"
                                        required
                                        eager-validation
                                    >
                                        <UInput
                                            v-model.number="monetizationDetails.percentageToOfferSharesFor"
                                            :placeholder="$t('data.investmentPlanner.percentageOfOwnership')"
                                            type="number"
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
                                    name="numberOfShares"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    eager-validation
                                >
                                    <UInput
                                        v-model.number="monetizationDetails.numberOfShares"
                                        :placeholder="$t('data.investmentPlanner.numberOfSharesPlaceholder')"
                                        type="number"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">shares</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup
                                    :label="$t('data.investmentPlanner.sharePrice')"
                                    class="flex-1"
                                    name="sharePrice"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    required
                                    eager-validation
                                >
                                    <UInput
                                        v-model.number="monetizationDetails.sharePrice"
                                        :placeholder="$t('data.investmentPlanner.sharePricePlaceholder')"
                                        type="number"
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
                                    name="maximumSharesToBuy"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    eager-validation
                                >
                                    <UInput
                                        v-model.number="monetizationDetails.maximumSharesToBuy"
                                        :placeholder="$t('data.investmentPlanner.maximumSharesToBuyPlaceholder')"
                                        type="number"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">shares</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <div
                                    class="flex-1 text-[13px] mt-5"
                                    :class="allBasicFieldsFilledIn ? 'opacity-100' : 'opacity-0'"
                                >
                                    You are making
                                    <span class="font-bold"
                                        >{{ monetizationDetails.percentageToOfferSharesFor || '__' }}%</span
                                    >
                                    of the dataset's future sales income available for investment, distributed across
                                    <span class="font-bold"
                                        >{{ monetizationDetails.numberOfShares || '__' }} shares</span
                                    >. Each share entitles the owner to
                                    <span class="font-bold">{{ percentageOfShare || '__' }}% </span>of the total
                                    revenue. Investors can purchase shares for
                                    <span class="font-bold">{{ monetizationDetails.sharePrice || '__' }} EUR</span>
                                    each, with a maximum of
                                    <span class="font-bold"
                                        >{{ monetizationDetails.maximumSharesToBuy || '__' }} shares</span
                                    >
                                    per person. The offer is valid until
                                    <span class="font-bold">{{
                                        monetizationDetails.validOfferDate
                                            ? dayjs(monetizationDetails.validOfferDate).format('DD/MM/YY')
                                            : '__'
                                    }}</span
                                    >.
                                </div>
                            </div>
                            <div class="flex flex-col w-full">
                                <UFormGroup
                                    :label="$t('data.investmentPlanner.termsAndConditions')"
                                    name="termsAndConditions"
                                    eager-validation
                                    required
                                >
                                    <UTextarea
                                        v-model="monetizationDetails.termsAndConditions"
                                        :placeholder="$t('data.investmentPlanner.termsAndConditions')"
                                    />
                                </UFormGroup>
                            </div>
                        </div>
                    </div>
                </div>
            </UCard>
            <div v-if="selectedPage === 1" class="relative w-full items-center justify-between flex mt-6">
                <UButton color="white" size="lg" @click="changeStep(selectedPage - 1)">Previous</UButton>
                <UButton size="lg" type="submit">Next</UButton>
            </div>
        </UForm>
        <div v-show="selectedPage === 2" class="w-full">
            <AccessPolicyList
                v-model:policy-data="policyData"
                :selected="selected"
                hide-buttons
                @update:policy-data="(value: AccessPolicyDetails[]) => (policyData = value)"
            />
            <div class="relative w-full items-center justify-between flex mt-6">
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
            </div>
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
                </div>
            </UCard>
            <AccessPolicyList preview :policy-data="policyData" />
        </div>
    </div>
    <div
        v-if="datasetsStatus !== 'pending' && selectedPage === 3"
        class="relative w-full items-center justify-between flex mt-6"
    >
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
        <UButton v-if="selectedPage === 3" size="lg" @click="submitAll">Submit</UButton>
    </div>
</template>
