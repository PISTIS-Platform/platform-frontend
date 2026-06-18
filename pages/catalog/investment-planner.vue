<script setup lang="ts">
const { t } = useI18n();
import dayjs from 'dayjs';
import * as R from 'ramda';
import { v4 as uuidV4 } from 'uuid';
import { z } from 'zod';

import { navigateTo } from '#app';

const { data: accountData } = await useFetch<Record<string, any>>(`/api/account/get-account-details`);

const { showErrorMessage, showSuccessMessage } = useAlertMessage();

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
        validOfferDate: z
            .date({ required_error: t('required') })
            .refine((date) => !dayjs(date).isBefore(dayjs().startOf('day')), {
                message: t('data.investmentPlanner.errors.pastDate'),
            }),
        percentageToOfferSharesFor: z.coerce
            .number({ invalid_type_error: t('data.investmentPlanner.errors.number') })
            .min(10, t('data.investmentPlanner.errors.percentageMin'))
            .max(49, t('data.investmentPlanner.errors.percentageMax')),
        numberOfShares: z.coerce
            .number({ invalid_type_error: t('data.investmentPlanner.errors.number') })
            .int(t('data.investmentPlanner.errors.sharesInt'))
            .min(10, t('data.investmentPlanner.errors.sharesMin'))
            .max(1000, t('data.investmentPlanner.errors.sharesMax')),
        sharePrice: z.coerce
            .number({ invalid_type_error: t('data.investmentPlanner.errors.number') })
            .int(t('data.investmentPlanner.errors.sharePriceInt'))
            .min(1, t('data.investmentPlanner.errors.sharePriceMin')),
        maximumSharesToBuy: z.coerce
            .number({ invalid_type_error: t('data.investmentPlanner.errors.number') })
            .int(t('data.investmentPlanner.errors.maxSharesInt'))
            .min(1, t('data.investmentPlanner.errors.maxSharesMin')),
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

const assetOfferingDetails = ref<{
    id: string | number;
    title: string;
    description: string;
    keywords: string[];
}>({
    id: '',
    title: '',
    description: '',
    keywords: [],
});

const selected = ref<
    | {
          id: string | number;
          title: string;
          description: string;
          distributions: Record<string, any>[];
          keywords: string[];
      }
    | undefined
>(undefined);

watch(selected, () => {
    if (!selected.value) return;
    assetOfferingDetails.value.title = selected.value.title;
    assetOfferingDetails.value.description = selected.value.description;
    assetOfferingDetails.value.id = selected.value.id;
    assetOfferingDetails.value.keywords = selected.value.keywords ?? [];
});

const {
    data: datasetsData,
    status: datasetsStatus,
    error: datasetsError,
} = useFetch<Record<string, any>[]>(`/api/datasets/get-all-on-marketplace`, {
    query: {
        nonFree: true,
    },
    server: false,
});

const sortByDateDesc = R.sortWith([R.descend(R.prop('modified'))]);

const transformedDatasets = computed(() => {
    if (!datasetsData.value || !datasetsData.value?.length) {
        return [];
    }
    return sortByDateDesc(
        datasetsData.value.map((dataset: Record<string, any>) => ({
            id: dataset.id,
            title: dataset.title.en,
            description: dataset.description.en,
            distributions: dataset.distributions,
            modified: dataset.modified,
            keywords: dataset.keywords?.map((keyword: any) => keyword.id) ?? [],
        })),
    );
});

const publishedAssetId = ref<string | null>(null);
const isLocked = computed(() => publishedAssetId.value !== null);

const steps = computed(() => [
    { name: t('data.investmentPlanner.steps.selectDataset'), isActive: !isLocked.value },
    {
        name: t('data.investmentPlanner.steps.investmentPlanner'),
        isActive: !isLocked.value && Boolean(selected.value) && isAssetOfferingDetailsValid.value,
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

const onInvestmentSubmit = () => {
    changeStep(2);
};

const loading = ref(false);
const newAssetId = uuidV4();

const buildInvestmentPayload = () => ({
    type: 'investment',
    cloudAssetId: String(assetOfferingDetails.value.id),
    sellerId: accountData.value?.user.sub,
    assetId: newAssetId,
    dueDate: dayjs(monetizationDetails.value.validOfferDate).toISOString(),
    percentageOffer: monetizationDetails.value.percentageToOfferSharesFor,
    totalShares: monetizationDetails.value.numberOfShares,
    maxShares: monetizationDetails.value.maximumSharesToBuy,
    price: monetizationDetails.value.sharePrice,
    status: true,
    terms: monetizationDetails.value.termsAndConditions,
    description: assetOfferingDetails.value.description,
    maxInvestors: monetizationDetails.value.numberOfShares,
});

type InvestmentPayload = ReturnType<typeof buildInvestmentPayload>;

const submittedPayload = ref<InvestmentPayload | null>(null);

const submitAll = async () => {
    if (loading.value) return;
    loading.value = true;

    try {
        if (publishedAssetId.value === null) {
            const payload = buildInvestmentPayload();
            submittedPayload.value = payload;
            await $fetch(`/api/datasets/publish-data`, {
                method: 'POST',
                body: payload,
            });
            publishedAssetId.value = newAssetId;
            showSuccessMessage(t('data.investmentPlanner.successfullyPublishedAsInvestmentPlan'));
        }

        await $fetch(`/api/investment/submit-investment`, {
            method: 'POST',
            body: submittedPayload.value,
        });
        showSuccessMessage(t('data.investmentPlanner.success'));
        navigateTo(`/marketplace/dataset-details/${submittedPayload.value!.cloudAssetId}?pm=cloud`);
    } catch {
        if (publishedAssetId.value === null) {
            showErrorMessage(t('data.investmentPlanner.errors.couldNotPublishInvestmentPlan'));
        } else {
            showErrorMessage(t('data.investmentPlanner.errors.couldNotCreateInvestmentPlanAfterPublish'));
        }
    } finally {
        loading.value = false;
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
    <UAlert
        v-else-if="!datasetsData || !datasetsData.length"
        :title="t('data.investmentPlanner.errors.noAssetsFoundError')"
        color="yellow"
        variant="subtle"
        icon="nonicons:not-found-16"
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
                :search-attributes="['title', 'description']"
                :options="transformedDatasets"
                option-attribute="title"
                :placeholder="$t('data.investmentPlanner.datasetSelectorPlaceholder')"
            >
                <template #option="{ option: dataset }">
                    <div class="flex flex-col gap-0.5">
                        <span class="font-semibold">{{ dataset.title }}</span>
                        <span class="text-gray-500 text-sm line-clamp-1">{{ dataset.description }}</span>
                    </div>
                </template>
            </USelectMenu>
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
                                        <UPopover :popper="{ placement: 'bottom-start' }" :disabled="isLocked">
                                            <UButton
                                                color="white"
                                                icon="i-heroicons-calendar-days-20-solid"
                                                :disabled="isLocked"
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
                                                    :min-date="dayjs().startOf('day').toDate()"
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
                                            :disabled="isLocked"
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
                                        :disabled="isLocked"
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
                                        :disabled="isLocked"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">PSTC</span>
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
                                        :disabled="isLocked"
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
                                    <span class="font-bold">{{ monetizationDetails.sharePrice || '__' }} PSTC</span>
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
                                        :disabled="isLocked"
                                    />
                                </UFormGroup>
                            </div>
                        </div>
                    </div>
                </div>
            </UCard>
            <div v-if="selectedPage === 1" class="relative w-full items-center justify-between flex mt-6">
                <UButton color="white" size="lg" :disabled="isLocked" @click="changeStep(selectedPage - 1)"
                    >Previous</UButton
                >
                <UButton size="lg" type="submit" :disabled="isLocked">Next</UButton>
            </div>
        </UForm>
        <div v-show="selectedPage === 2" class="w-full">
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
                        <span>{{ monetizationDetails.sharePrice }} PSTC</span>
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
        </div>
    </div>
    <div
        v-if="datasetsStatus !== 'pending' && selectedPage === 2"
        class="relative w-full items-center justify-between flex mt-6"
    >
        <UButton
            color="white"
            size="lg"
            :disabled="selectedPage === 0 || isLocked"
            @click="changeStep(selectedPage - 1)"
            >Previous</UButton
        >
        <UButton
            v-if="selectedPage !== 2"
            size="lg"
            :disabled="!steps[selectedPage + 1]?.isActive"
            @click="changeStep(selectedPage + 1)"
            >Next</UButton
        >
        <UButton v-if="selectedPage === 2" size="lg" :disabled="loading" @click="submitAll">
            <UIcon v-if="loading" name="svg-spinners:270-ring-with-bg" />
            <span v-else> {{ $t('submit') }}</span>
        </UButton>
    </div>
</template>
