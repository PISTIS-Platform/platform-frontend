<script setup lang="ts">
import dayjs from 'dayjs';
import { z } from 'zod';

const route = useRoute();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();
const { t } = useI18n();
const router = useRouter();

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
    query: { cloudAssetId: route.params.id },
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
        router.push('/dashboard');
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
    <UProgress v-if="retrieveStatus === 'pending'" animation="carousel" color="primary" />
    <div class="justify-center items-center px-8 max-w-7xl mx-auto w-full mt-6">
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
                                    <span class="text-sm font-semibold text-gray-400">{{
                                        $t('invest.assetDescription')
                                    }}</span>
                                    <span>{{ investmentPlan.description }}</span>
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
                                    <span class="text-sm font-semibold text-gray-400">{{
                                        $t('invest.validUntil')
                                    }}</span>
                                    <span
                                        ><span class="text-lg">{{
                                            dayjs(investmentPlan.dueDate).format('DD MMM YYYY')
                                        }}</span></span
                                    >
                                </div>
                                <div class="flex gap-1 flex-col">
                                    <span class="text-sm font-semibold text-gray-400">{{
                                        $t('invest.availableShares')
                                    }}</span>
                                    <span
                                        ><span class="text-lg"
                                            >{{ investmentPlan.remainingShares }} /
                                            {{ investmentPlan.totalShares }}</span
                                        >
                                        shares</span
                                    >
                                </div>
                            </div>
                            <div class="flex flex-col gap-4 w-full">
                                <div class="flex gap-1 flex-col">
                                    <span class="text-sm font-semibold text-gray-400">{{
                                        $t('invest.maxPerInvestor')
                                    }}</span>
                                    <span
                                        ><span class="text-lg">{{ investmentPlan.maxShares }}</span> shares</span
                                    >
                                </div>
                                <div class="flex gap-1 flex-col">
                                    <span class="text-sm font-semibold text-gray-400">{{
                                        $t('invest.sharePercentage')
                                    }}</span>
                                    <span
                                        ><span class="text-lg"
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
                                    <span class="text-sm font-semibold text-gray-400">{{
                                        $t('invest.sharePrice')
                                    }}</span>
                                    <span
                                        ><span class="text-lg">{{ investmentPlan.price }} EUR</span> per share</span
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
                <div class="mt-6 mb-2">
                    <UForm
                        :submit="purchaseShares"
                        :state="state"
                        :schema="schema"
                        class="flex items-end gap-6 relative"
                    >
                        <UFormGroup
                            :label="$t('invest.numberOfSharesToPurchase')"
                            name="sharesToPurchase"
                            :ui="{ container: 'w-64', error: 'absolute -bottom-6 w-full' }"
                            required
                            eager-validation
                        >
                            <UInput
                                v-model.number="state.sharesToPurchase"
                                type="number"
                                size="xl"
                                min="1"
                                :max="investmentPlan.maxShares"
                                class="w-64"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">{{
                                        state.sharesToPurchase === 1 ? $t('invest.share') : $t('invest.shares')
                                    }}</span>
                                </template>
                            </UInput>
                        </UFormGroup>

                        <UButton
                            class="cursor-pointer"
                            size="xl"
                            type="submit"
                            :disabled="numberOfSharesError"
                            @click="purchaseShares"
                            >{{ $t('invest.pay') }} ({{ state.sharesToPurchase * investmentPlan.price }} EUR)</UButton
                        >
                    </UForm>
                </div>
            </UCard>
        </PageContainer>
    </div>
</template>
