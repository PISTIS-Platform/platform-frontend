<script setup lang="ts">
import dayjs from 'dayjs';

const { t } = useI18n();
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

const frequencyMappings = {
    hour: t('perHour'),
    day: t('perDay'),
    week: t('perWeek'),
    month: t('perMonth'),
    year: t('perYear'),
};

const transferableSelections = [
    {
        label: t('data.designer.transferable'),
        value: 'transferable',
    },
    {
        label: t('data.designer.nonTransferable'),
        value: 'non-transferable',
    },
    {
        label: t('data.designer.subLicensable'),
        value: 'sub-licensable',
    },
];
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
                </div>
            </div>
        </UCard>

        <UCard>
            <template #header>
                <SubHeading
                    :title="$t('data.designer.licenseDetails') + ' - ' + $t('preview')"
                    :info="$t('data.designer.licenseDetailsDescription')"
                />
            </template>
            <div class="flex flex-col gap-4">
                <span class="font-semibold text-sm -mb-3">{{ $t('data.designer.fields.licenseSelection') }}</span>
                <div class="w-full border-t"></div>
                <span class="text-sm font-semibold text-gray-400">{{ $t('license') }}</span>
                <span>{{ monetizationDetails.license }}</span>
                <span class="font-semibold text-sm -mb-3 mt-5">{{
                    $t('data.designer.fields.downloadLimitFrequency')
                }}</span>
                <div class="w-full border-t"></div>
                <div class="flex items-center gap-8">
                    <div class="flex flex-col gap-4">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.downloadLimit') }}</span>
                        <span
                            >{{ monetizationDetails.limitNumber }} {{ $t('times') }}
                            {{ frequencyMappings[monetizationDetails.limitFrequency] }}</span
                        >
                    </div>
                </div>
            </div>
            <div v-if="monetizationDetails.license === 'PISTIS License'" class="flex flex-col gap-4 mt-3">
                <span class="font-semibold text-sm -mb-3 mt-5">{{
                    $t('data.designer.fields.exclusivityAndAvailability')
                }}</span>
                <div class="w-full border-t"></div>
                <div class="flex items-center gap-8">
                    <div class="flex flex-col gap-4">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('exclusive') }}</span>
                        <span>{{ monetizationDetails.isExclusive ? $t('yes') : $t('no') }}</span>
                    </div>
                    <div class="flex flex-col gap-4">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.availability') }}</span>
                        <span v-if="monetizationDetails.region.length" class="flex items-center gap-2 flex-wrap">
                            <span v-for="(country, index) in monetizationDetails.region" :key="country"
                                >{{ country }}<span v-if="index !== monetizationDetails.region.length - 1">,</span>
                            </span>
                        </span>
                        <span v-else>{{ $t('data.designer.worldwide') }}</span>
                    </div>
                </div>
                <span class="font-semibold text-sm -mb-3 mt-5">{{ $t('data.designer.fields.licensingDetails') }}</span>
                <div class="w-full border-t"></div>
                <div class="flex items-center gap-8">
                    <div class="flex flex-col gap-4">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.transferable') }}</span>
                        <span>{{
                            transferableSelections.find((item) => item.value === monetizationDetails.transferable).label
                        }}</span>
                    </div>
                    <div class="flex flex-col gap-4">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.termDate') }}</span>
                        <span>{{
                            monetizationDetails.termDate
                                ? dayjs(monetizationDetails.termDate).format('DD MMMM YYYY')
                                : $t('data.designer.licenseIsPerpetual')
                        }}</span>
                    </div>
                </div>
                <div
                    v-if="monetizationDetails.extraTerms || monetizationDetails.additionalRenewalTerms"
                    class="flex flex-col gap-4"
                >
                    <span class="font-semibold text-sm -mb-3 mt-5">{{
                        $t('data.designer.fields.additionalTerms')
                    }}</span>
                    <div class="w-full border-t"></div>
                    <span v-if="monetizationDetails.extraTerms" class="text-sm font-semibold text-gray-400">{{
                        $t('termsConditions')
                    }}</span>
                    <p v-if="monetizationDetails.extraTerms" class="text-sm">
                        {{ monetizationDetails.extraTerms }}
                    </p>
                    <span
                        v-if="monetizationDetails.additionalRenewalTerms"
                        class="text-sm font-semibold text-gray-400"
                        >{{ $t('data.designer.additionalRenewalTerms') }}</span
                    >
                    <p v-if="monetizationDetails.additionalRenewalTerms" class="text-sm">
                        {{ monetizationDetails.additionalRenewalTerms }}
                    </p>
                </div>
                <span class="font-semibold text-sm -mb-3 mt-5">{{ $t('data.designer.fields.contractDetails') }}</span>
                <div class="w-full border-t"></div>
                <div class="flex items-center gap-8">
                    <div class="flex flex-col gap-4">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.noticeForNonRenewal')
                        }}</span>
                        <span>{{ monetizationDetails.nonRenewalDays }}</span>
                    </div>
                    <div class="flex flex-col gap-4">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.maximumDaysContractBreach')
                        }}</span>
                        <span>{{ monetizationDetails.contractBreachDays }}</span>
                    </div>
                </div>
                <div v-if="hasPersonalData" class="flex flex-col gap-4">
                    <span class="font-semibold text-sm -mb-3 mt-5">{{ $t('data.designer.fields.personalData') }}</span>
                    <div class="w-full border-t"></div>
                    <div class="flex flex-col gap-4">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.personalDataTerms')
                        }}</span>
                        <p class="text-sm">{{ monetizationDetails.personalDataTerms }}</p>
                    </div>
                </div>
            </div>
            <div class="font-semibold text-sm mb-1 mt-8">{{ $t('licenseDetails') }}</div>
            <div class="w-full border-t"></div>
            <DataShareTerms
                :asset-offering-details="assetOfferingDetails"
                :monetization-details="monetizationDetails"
                class="mt-8"
            />
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
                        :disabled="submitStatus === 'pending' || submitStatus === 'success'"
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
