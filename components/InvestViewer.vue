<script setup lang="ts">
import dayjs from 'dayjs';
import { z } from 'zod';

const { showSuccessMessage, showErrorMessage } = useAlertMessage();
const { t } = useI18n();

const emit = defineEmits(['closeModal']);

const props = defineProps({
    assetId: {
        type: String,
        required: true,
    },
});

type InvestmentPlan = {
    title: string;
    description: string;
    id: string;
    cloudAssetId: string;
    assetId: string;
    dueDate: string;
    percentageOffer: number;
    totalShares: number;
    remainingShares: number;
    maxShares: number;
    status: boolean;
    price: number;
    createdAt: string;
    updatedAt: string;
    terms: string;
};

const schema = computed(() =>
    z.object({
        sharesToPurchase: z
            .number()
            .min(1, { message: t('invest.pleaseError', { min: 1, max: investmentPlan.value?.maxShares }) })
            .max(investmentPlan.value?.maxShares, {
                message: t('invest.pleaseError', { min: 1, max: investmentPlan.value?.maxShares }),
            }),
    }),
);

const state = reactive({
    sharesToPurchase: 1,
});

const {
    data: investmentPlan,
    status: retrieveStatus,
    error: retrieveError,
} = await useFetch<InvestmentPlan>(`/api/invest/retrieve-investment-plan`, {
    method: 'GET',
    query: { cloudAssetId: props.assetId },
});

const { data: userHasInvested, status: hasInvestedStatus } = await useFetch<boolean>(`/api/invest/user-has-invested`, {
    method: 'POST',
    body: {
        assetId: props.assetId,
    },
});

const purchaseShares = async () => {
    try {
        await $fetch(`/api/invest/invest`, {
            method: 'PUT',
            query: { investmentId: investmentPlan.value?.id },
            body: {
                numberOfShares: state.sharesToPurchase,
            },
        });
        showSuccessMessage(t('invest.purchaseSuccessful'));
        emit('closeModal');
    } catch {
        showErrorMessage(t('invest.couldNotPurchaseShares'));
    }
};

const numberOfSharesError = computed(() => {
    if (!investmentPlan.value) return false;
    return state.sharesToPurchase < 1 || state.sharesToPurchase > investmentPlan.value.maxShares;
});
</script>

<template>
    <UProgress
        v-if="retrieveStatus === 'pending' || hasInvestedStatus === 'pending'"
        animation="carousel"
        color="primary"
    />
    <div class="justify-center items-center max-w-7xl w-full text-gray-600">
        <PageContainer>
            <ErrorCard
                v-if="retrieveError"
                :error-msg="retrieveError.data?.data?.message ?? $t('invest.retrieveError')"
            />
            <UCard v-else-if="investmentPlan" class="w-full">
                <template #header>
                    <div class="flex items-center gap-4">
                        <UIcon name="streamline:investment-selection" class="w-10 h-10 text-gray-500" />
                        <SubHeading :title="$t('invest.title')" :info="$t('invest.info')" />
                    </div>
                </template>
                <div class="flex gap-6 flex-col w-full">
                    <UCard class="bg-gray-50 w-full">
                        <template #header>
                            <div class="flex items-center gap-3">
                                <UIcon name="tabler:list-details" class="h-6 w-6 text-gray-500" />
                                <span class="text-gray-500 font-semibold">{{ $t('invest.assetDetails') }}</span>
                            </div>
                        </template>
                        <div class="flex gap-6">
                            <div class="flex flex-col gap-4 w-full">
                                <div class="flex gap-1 flex-col">
                                    <span class="text-gray-400 uppercase text-xs font-semibold">{{
                                        $t('invest.assetDescription')
                                    }}</span>
                                    <span class="text-base">{{ investmentPlan.description }}</span>
                                </div>
                            </div>
                        </div>
                    </UCard>
                    <UCard class="bg-gray-50 w-full">
                        <template #header>
                            <div class="flex items-center gap-3">
                                <UIcon name="dashicons:money-alt" class="h-6 w-6 text-gray-500" />
                                <span class="text-gray-500 font-semibold">{{ $t('invest.investmentDetails') }}</span>
                            </div>
                        </template>
                        <div class="flex items-start gap-6">
                            <div class="flex flex-col gap-4 w-full">
                                <div class="flex gap-1 flex-col">
                                    <span class="text-gray-400 uppercase text-xs font-semibold">{{
                                        $t('invest.validUntil')
                                    }}</span>
                                    <span
                                        ><span class="text-base">{{
                                            dayjs(investmentPlan.dueDate).format('DD MMM YYYY')
                                        }}</span></span
                                    >
                                </div>
                                <div class="flex gap-1 flex-col">
                                    <span class="text-gray-400 uppercase text-xs font-semibold">{{
                                        $t('invest.availableShares')
                                    }}</span>
                                    <span
                                        ><span class="text-base"
                                            >{{ investmentPlan.remainingShares }} /
                                            {{ investmentPlan.totalShares }}</span
                                        >
                                        shares</span
                                    >
                                </div>
                            </div>
                            <div class="flex flex-col gap-4 w-full">
                                <div class="flex gap-1 flex-col">
                                    <span class="text-gray-400 uppercase text-xs font-semibold">{{
                                        $t('invest.maxPerInvestor')
                                    }}</span>
                                    <span
                                        ><span class="text-base">{{ investmentPlan.maxShares }}</span> shares</span
                                    >
                                </div>
                                <div class="flex gap-1 flex-col">
                                    <span class="text-gray-400 uppercase text-xs font-semibold">{{
                                        $t('invest.sharePercentage')
                                    }}</span>
                                    <span
                                        ><span class="text-base"
                                            >{{
                                                (investmentPlan.percentageOffer / investmentPlan.totalShares).toFixed(
                                                    3,
                                                )
                                            }}%</span
                                        >
                                        per share</span
                                    >
                                </div>
                            </div>
                            <div class="flex flex-col gap-4 w-full">
                                <div class="flex gap-1 flex-col">
                                    <span class="text-gray-400 uppercase text-xs font-semibold">{{
                                        $t('invest.sharePrice')
                                    }}</span>
                                    <span
                                        ><span class="text-base">{{ investmentPlan.price }} €</span> per share</span
                                    >
                                </div>
                            </div>
                        </div>
                    </UCard>
                    <UCard class="bg-gray-50 w-full">
                        <template #header>
                            <div class="flex items-center gap-3">
                                <UIcon name="clarity:contract-line" class="h-6 w-6 text-gray-500" />
                                <span class="text-gray-500 font-semibold">{{ $t('invest.termsAndConditions') }}</span>
                            </div>
                        </template>
                        <div class="flex flex-col gap-4 w-full">
                            <div class="flex gap-1 flex-col">
                                <div class="whitespace-pre-line max-h-[10lh] overflow-y-scroll">
                                    {{ investmentPlan.terms }}
                                </div>
                            </div>
                        </div>
                    </UCard>
                </div>
                <div class="mt-6 mb-2 flex">
                    <UForm
                        :submit="purchaseShares"
                        :state="state"
                        :schema="schema"
                        class="flex items-end justify-between gap-6 relative w-full"
                    >
                        <UFormGroup
                            :label="$t('invest.numberOfSharesToPurchase')"
                            name="sharesToPurchase"
                            :ui="{ container: 'w-96', error: 'absolute -bottom-6 w-full' }"
                            required
                            eager-validation
                        >
                            <div class="flex items-center gap-4">
                                <UInput
                                    v-model.number="state.sharesToPurchase"
                                    type="number"
                                    size="md"
                                    min="1"
                                    :max="investmentPlan.maxShares"
                                    class="w-32"
                                >
                                    <template #trailing>
                                        <span class="text-gray-500 text-xs ml-6">{{
                                            state.sharesToPurchase === 1 ? $t('invest.share') : $t('invest.shares')
                                        }}</span>
                                    </template>
                                </UInput>
                                <span class="text-nowrap font-semibold text-gray-500 items-start"
                                    >Total
                                    <span class="text-primary font-bold text-xl ml-1">
                                        {{ state.sharesToPurchase * investmentPlan.price }} €</span
                                    ></span
                                >
                            </div>
                        </UFormGroup>

                        <UTooltip
                            :prevent="!userHasInvested"
                            :class="!userHasInvested ? '' : 'cursor-pointer'"
                            :ui="{ width: 'max-w-2xl', base: 'text-wrap p-2 h-24' }"
                            :text="$t('invest.alreadyError')"
                        >
                            <UButton
                                class="cursor-pointer px-8"
                                size="lg"
                                type="submit"
                                :disabled="numberOfSharesError || Boolean(userHasInvested)"
                                @click="purchaseShares"
                                >{{ $t('invest.pay') }}</UButton
                            >
                        </UTooltip>
                    </UForm>
                </div>
            </UCard>
        </PageContainer>
    </div>
</template>
