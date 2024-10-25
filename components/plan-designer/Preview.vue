<script setup lang="ts">
import dayjs from 'dayjs';

defineProps({
    assetOfferingDetails: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
    monetizationDetails: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
    limitFrequencySelections: {
        type: Array<Record<string, any>>,
        required: true,
    },
    isPerpetual: {
        type: Boolean,
        required: true,
    },
    isWorldwide: {
        type: Boolean,
        required: true,
    },
    hasPersonalData: {
        type: Boolean,
        required: true,
    },
    submitStatus: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['handlePageSelectionBackwards', 'submitAll']);
</script>

<template>
    <div class="w-full h-full text-gray-700 space-y-8">
        <UCard>
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
                    <span class="text-sm font-semibold text-gray-400">{{ $t('data.selectedDistribution') }}</span>
                    <span>{{ assetOfferingDetails?.selectedDistribution?.label }}</span>
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
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.oneOffPrice') }}</span>
                        <span>{{
                            monetizationDetails.price ? monetizationDetails.price + ' EUR' : $t('data.designer.free')
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
                            limitFrequencySelections.find((item) => item.value === monetizationDetails.limitFrequency)
                                ?.title
                        }}</span>
                    </div>
                </div>
                <div class="flex items-start gap-8">
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('exclusive') }}</span>
                        <span>{{ monetizationDetails.isExclusive ? $t('yes') : $t('no') }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.availability') }}</span>
                        <span>{{ isWorldwide ? $t('worldwide') : monetizationDetails.region }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.transferable') }}</span>
                        <span>{{ monetizationDetails.transferable }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.termDate') }}</span>
                        <span>{{
                            isPerpetual
                                ? $t('data.designer.perpetual')
                                : dayjs(monetizationDetails.termDate).format('YYYY/MM/DD')
                        }}</span>
                    </div>
                </div>
                <div v-if="monetizationDetails.extraTerms" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('termsConditions') }}</span>
                    <span>{{ monetizationDetails.extraTerms }}</span>
                </div>
                <div v-if="monetizationDetails.additionalRenewalTerms" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{
                        $t('data.designer.additionalRenewalTerms')
                    }}</span>
                    <span>{{ monetizationDetails.additionalRenewalTerms }}</span>
                </div>
                <div class="flex items-start gap-8">
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.noticeForNonRenewal')
                        }}</span>
                        <span>{{ monetizationDetails.nonRenewalDays }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.maximumDaysContractBreach')
                        }}</span>
                        <span>{{ monetizationDetails.contractBreachDays }}</span>
                    </div>
                </div>
                <div v-if="hasPersonalData" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.personalDataTerms') }}</span>
                    <span>{{ monetizationDetails.personalDataTerms }}</span>
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
                            $t('data.designer.subscriptionPrice') + ' & ' + $t('data.designer.subscriptionFrequency')
                        }}</span>
                        <span>{{
                            monetizationDetails.price
                                ? monetizationDetails.price +
                                  ' EUR ' +
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
                            limitFrequencySelections.find((item) => item.value === monetizationDetails.limitFrequency)
                                ?.title
                        }}</span>
                    </div>
                </div>
                <div class="flex items-start gap-8">
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('exclusive') }}</span>
                        <span>{{ monetizationDetails.isExclusive ? $t('yes') : $t('no') }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.availability') }}</span>
                        <span>{{ isWorldwide ? $t('worldwide') : monetizationDetails.region }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.transferable') }}</span>
                        <span>{{ monetizationDetails.transferable }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.termDate') }}</span>
                        <span>{{ isPerpetual ? $t('data.designer.perpetual') : monetizationDetails.termDate }}</span>
                    </div>
                </div>
                <div v-if="monetizationDetails.extraTerms" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('termsConditions') }}</span>
                    <span>{{ monetizationDetails.extraTerms }}</span>
                </div>
                <div v-if="monetizationDetails.additionalRenewalTerms" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{
                        $t('data.designer.additionalRenewalTerms')
                    }}</span>
                    <span>{{ monetizationDetails.additionalRenewalTerms }}</span>
                </div>
                <div class="flex items-start gap-8">
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.noticeForNonRenewal')
                        }}</span>
                        <span>{{ monetizationDetails.nonRenewalDays }}</span>
                    </div>
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.maximumDaysContractBreach')
                        }}</span>
                        <span>{{ monetizationDetails.contractBreachDays }}</span>
                    </div>
                </div>
                <div v-if="hasPersonalData" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.personalDataTerms') }}</span>
                    <span>{{ monetizationDetails.personalDataTerms }}</span>
                </div>
            </div>
            <div class="w-full flex justify-between items-center mt-8">
                <UButton size="md" color="gray" variant="outline" @click="emit('handlePageSelectionBackwards', 2)">
                    {{ $t('back') }}
                </UButton>
                <div class="flex items-center gap-4 w-full justify-end">
                    <UAlert
                        v-show="submitStatus === 'error'"
                        icon="mingcute:alert-line"
                        color="red"
                        variant="subtle"
                        :description="$t('data.designer.errorInSubmitAsset')"
                        class="w-full max-w-xl"
                    />
                    <UAlert
                        v-show="submitStatus === 'success'"
                        icon="mingcute:alert-line"
                        color="green"
                        variant="subtle"
                        :description="$t('data.designer.assetSubmitted')"
                        class="w-full max-w-xl"
                    />
                    <UButton
                        :disabled="submitStatus === 'pending'"
                        class="px-4 py-2 w-32 block"
                        @click="emit('submitAll')"
                    >
                        <UIcon v-if="submitStatus === 'pending'" name="svg-spinners:270-ring-with-bg" />
                        <span v-else> {{ $t('submit') }}</span>
                    </UButton>
                </div>
            </div>
        </UCard>
    </div>
</template>
