<script setup lang="ts">
const { t } = useI18n();
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
    licenseDetails: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
    policyData: {
        type: Object as PropType<Record<string, any>[]>,
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

import { LicenseCode } from '~/constants/licenses';

const emit = defineEmits(['handlePageSelectionBackwards', 'submitAll']);

const subscriptionMapping: Record<string, string> = {
    subscription: t('data.designer.subscription'),
    'one-off': t('data.designer.oneOffSale'),
    nft: 'NFT',
};
</script>

<template>
    <div class="w-full h-full text-gray-700 space-y-8">
        <UCard>
            <template #header>
                <div class="flex items-center gap-8">
                    <UIcon name="tabler:list-details" class="w-10 h-10 text-gray-500 -mr-4" />
                    <SubHeading
                        :title="$t('data.designer.assetOfferingDetails') + ' - ' + $t('preview')"
                        :info="$t('data.designer.assetOfferingDetailsInfo')"
                    />
                </div>
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
                <div v-if="licenseDetails.license !== LicenseCode.NFT" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('data.selectedDistribution') }}</span>
                    <span>{{ assetOfferingDetails?.selectedDistribution?.label }}</span>
                </div>
                <div v-if="licenseDetails.license !== LicenseCode.NFT" class="flex gap-2 flex-col">
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
                <div class="flex items-center gap-8">
                    <UIcon name="material-symbols:monetization-on" class="w-10 h-10 text-gray-500 -mr-4" />
                    <SubHeading
                        :title="$t('data.designer.monetizationMethod') + ' - ' + $t('preview')"
                        :info="$t('data.designer.monetizationMethodInfo')"
                    />
                </div>
            </template>
            <div class="flex flex-col gap-8">
                <div class="flex items-start w-full">
                    <div class="flex gap-2 flex-col w-1/2">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.monetizationMethod')
                        }}</span>
                        <span>{{ subscriptionMapping[monetizationDetails.type] }}</span>
                    </div>
                    <div
                        v-if="monetizationDetails.type === 'one-off' || monetizationDetails.type === 'nft'"
                        class="flex gap-2 flex-col w-1/2"
                    >
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.price') }}</span>
                        <span>{{
                            monetizationDetails.price ? monetizationDetails.price + ' EUR' : $t('data.designer.free')
                        }}</span>
                    </div>
                    <div v-if="monetizationDetails.type === 'subscription'" class="flex gap-2 flex-col w-1/2">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.price') + ' & ' + $t('data.designer.subscriptionFrequency')
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
                </div>
            </div>
        </UCard>

        <UCard>
            <template #header>
                <div class="flex items-center gap-8">
                    <UIcon name="clarity:license-solid" class="w-10 h-10 text-gray-500 -mr-4" />
                    <SubHeading
                        :title="$t('data.designer.licenseSelector') + ' - ' + $t('preview')"
                        :info="$t('data.designer.licenseSelectorInfo')"
                    />
                </div>
            </template>
            <div class="flex flex-col gap-8">
                <div class="flex items-start w-full">
                    <div class="flex gap-2 flex-col w-1/2">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('license') }}</span>
                        <span>{{ licenseDetails.license }}</span>
                    </div>
                    <div v-if="licenseDetails.license !== LicenseCode.NFT" class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.downloadLimit') + ' & ' + $t('frequency')
                        }}</span>
                        <span>{{
                            licenseDetails.limitNumber +
                            ' ' +
                            $t('times') +
                            ' ' +
                            limitFrequencySelections.find((item) => item.value === licenseDetails.limitFrequency)?.title
                        }}</span>
                    </div>
                </div>
                <div v-if="licenseDetails.license === LicenseCode.PISTIS" class="flex items-start w-full">
                    <div class="flex gap-2 flex-col w-1/2">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('exclusive') }}</span>
                        <span>{{ licenseDetails.isExclusive ? $t('yes') : $t('no') }}</span>
                    </div>
                    <div v-if="isWorldwide" class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.availability') }}</span>
                        <span>{{ $t('worldwide') }}</span>
                    </div>
                    <div v-else class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.availability') }}</span>
                        <span class="flex items-center gap-2 flex-wrap">
                            <span v-for="(country, idx) in licenseDetails.region" :key="country">
                                <span>{{ $t(`countries.${country}`) }}</span>
                                <span v-if="idx !== licenseDetails.region.length - 1">,</span>
                            </span>
                        </span>
                    </div>
                </div>
                <div v-if="licenseDetails.license === LicenseCode.PISTIS" class="flex items-start w-full">
                    <div class="flex gap-2 flex-col w-1/2">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.transferable') }}</span>
                        <span>{{ licenseDetails.transferable }}</span>
                    </div>
                    <div class="flex gap-2 flex-col w-1/2">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.termDate') }}</span>
                        <span>{{
                            isPerpetual
                                ? $t('data.designer.perpetual')
                                : dayjs(licenseDetails.termDate).format('DD/MM/YYYY')
                        }}</span>
                    </div>
                </div>
                <div v-if="licenseDetails.license === LicenseCode.PISTIS" class="flex items-start w-full">
                    <div class="flex gap-2 flex-col w-1/2">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.noticeForNonRenewal')
                        }}</span>
                        <span>{{ licenseDetails.nonRenewalDays }}</span>
                    </div>
                    <div class="flex gap-2 flex-col w-1/2">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.maximumDaysContractBreach')
                        }}</span>
                        <span>{{ licenseDetails.contractBreachDays }}</span>
                    </div>
                </div>
                <div v-if="hasPersonalData" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.personalDataTerms') }}</span>
                    <span>{{ licenseDetails.personalDataTerms }}</span>
                </div>
                <div v-if="licenseDetails.extraTerms" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('termsConditions') }}</span>
                    <span>{{ licenseDetails.extraTerms }}</span>
                </div>
                <div v-if="licenseDetails.additionalRenewalTerms" class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{
                        $t('data.designer.additionalRenewalTerms')
                    }}</span>
                    <span>{{ licenseDetails.additionalRenewalTerms }}</span>
                </div>
            </div>
        </UCard>

        <AccessPolicyList preview :policy-data="policyData" />

        <div class="w-full flex justify-between items-center mt-8">
            <UButton size="md" color="gray" variant="outline" @click="emit('handlePageSelectionBackwards', 3)">
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
                    :disabled="submitStatus === 'pending' || submitStatus === 'success'"
                    class="px-4 py-2 w-32 block"
                    @click="emit('submitAll')"
                >
                    <UIcon v-if="submitStatus === 'pending'" name="svg-spinners:270-ring-with-bg" />
                    <span v-else> {{ $t('submit') }}</span>
                </UButton>
            </div>
        </div>
    </div>
</template>
