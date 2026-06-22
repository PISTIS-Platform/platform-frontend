<template>
    <UCard>
        <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
            <!-- Header -->
            <header
                class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-300 pb-6"
            >
                <h3 class="text-4xl font-semibold text-gray-900">
                    {{ t('data.valuation.header') }}
                </h3>
            </header>

            <!-- Dataset Selector -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <UIcon name="oui:pages-select" class="w-10 h-10 text-gray-500" />
                            <SubHeading
                                :title="$t('data.quality.headers.dataSelectorTitle')"
                                :info="$t('data.valuation.info')"
                            />
                        </div>
                        <!-- <div>
              <button
                  class="bg-secondary-500 text-white px-3 py-2 rounded text-sm hover:bg-secondary-600"
                  @click="exportStagedRules"
              >
                  {{ t('data.quality.button.sendQuery') }}
              </button>
            </div> -->
                    </div>
                </template>
                <USelectMenu
                    v-model="selected"
                    searchable
                    :search-attributes="['title', 'description']"
                    :options="transformedDatasets"
                    option-attribute="title"
                    :placeholder="$t('data.quality.placeholder.datasetSelector')"
                >
                    <template #option="{ option: dataset }">
                        <div class="flex flex-col gap-0.5">
                            <span class="font-semibold">{{ dataset.title }}</span>
                            <span class="text-gray-500 text-sm line-clamp-1">{{ dataset.description }}</span>
                        </div>
                    </template>
                </USelectMenu>
            </UCard>
        </div>

        <UCard class="data-valuation-config max-w-2xl mx-auto p-6">
            <div>
                <div v-for="item in items" :key="item.title" class="mb-4">
                    <UFormGroup class="w-full">
                        <div class="flex w-full items-center justify-between gap-4">
                            <div class="text-base font-medium">{{ item.title }}</div>
                            <div class="text-sm font-semibold text-right text-pistis-600">
                                {{ getLabel(item.value) }}
                            </div>
                        </div>
                        <div class="mt-3 w-full">
                            <UInput
                                v-model.number="item.value"
                                type="range"
                                min="0"
                                max="1"
                                step="0.25"
                                class="w-full accent-primary-500"
                            />
                        </div>
                    </UFormGroup>
                </div>

                <div class="flex items-center justify-center mt-6">
                    <UButton
                        :disabled="loadingValuation"
                        class="bg-secondary-500 text-white px-3 py-2 rounded text-sm hover:bg-secondary-600"
                        @click="submit"
                    >
                        <UIcon v-if="loadingValuation" name="svg-spinners:270-ring-with-bg" class="mr-2" />
                        {{ t('data.valuation.submit') }}
                    </UButton>
                </div>

                <UAlert v-if="showValuationData" class="mt-8" variant="subtle" :color="valuationAlertColor">
                    <template #title>
                        <div class="w-full flex items-center justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <UIcon :name="valuationIcons[valuationRating] ?? 'ic:outline-star'" class="w-8 h-8" />
                                <UButton
                                    :color="valuationAlertColor"
                                    :class="`cursor-default hover:bg-${valuationAlertColor}`"
                                >
                                    {{ (numberRating * 10).toFixed(1) }}
                                </UButton>
                            </div>
                            <div class="flex items-center gap-4 text-gray-600">
                                <span class="font-bold text-sm">{{ t('data.designer.valuation.title') }}</span>
                                <UIcon name="streamline-ultimate:rating-star-ribbon-bold" class="w-6 h-6" />
                            </div>
                        </div>
                    </template>

                    <template #description>
                        <div class="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 text-gray-600">
                            <div v-for="key in Object.keys(valuationData)" :key="key" class="flex flex-col gap-2">
                                <div class="flex items-center justify-between w-full">
                                    <div class="flex items-center gap-2">
                                        <span class="font-semibold text-xs">{{
                                            t(`data.designer.valuation.${key}`)
                                        }}</span>
                                        <UPopover mode="hover" :popper="{ placement: 'top' }" class="mt-1">
                                            <UIcon name="mdi:information-outline" class="text-gray-500 h-4 w-4" />
                                            <template #panel>
                                                <div class="max-w-xl p-2 flex text-wrap text-xs">
                                                    {{ explanations[key] }}
                                                </div>
                                            </template>
                                        </UPopover>
                                    </div>
                                    <span class="font-semibold text-xs">
                                        {{
                                            valuationData[key] === 'N/A'
                                                ? 'N/A'
                                                : ((valuationData[key] as number) * 10).toFixed(1)
                                        }}
                                    </span>
                                </div>
                                <UProgress
                                    :value="valuationData[key] === 'N/A' ? 0 : (valuationData[key] as number) * 10"
                                    :min="0"
                                    :max="10"
                                    color="primary"
                                />
                            </div>
                        </div>
                    </template>
                </UAlert>
            </div>
        </UCard>
    </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useI18n } from '#imports';

const { t } = useI18n();
import * as R from 'ramda';
import { boolean, number } from 'zod';

// const route = useRoute();

const runtimeConfig = useRuntimeConfig();
const ownFactoryOrgId = runtimeConfig.public.orgId;

const notification = ref('');
const showValuationData = ref(false);
const loadingValuation = ref(false);
const valuationRating = ref('');
const numberRating = ref(0);
const valuationData = ref<Record<string, number | string>>({});

const valuationColors = {
    A: 'green',
    B: 'yellow',
    C: 'primary',
    D: 'red',
    E: 'red',
} as const;

const valuationAlertColor = computed(() => {
    if (valuationRating.value && valuationRating.value in valuationColors) {
        return valuationColors[valuationRating.value as keyof typeof valuationColors];
    }

    return 'blue';
});

const valuationIcons: Record<string, string> = {
    A: 'emojione-monotone:letter-a',
    B: 'emojione-monotone:letter-b',
    C: 'emojione-monotone:letter-c',
    D: 'emojione-monotone:letter-d',
    E: 'emojione-monotone:letter-e',
};

// Notification logic
function showNotification(msg) {
    notification.value = msg;
    setTimeout(() => (notification.value = ''), 2500);
}

const offerMetadata = ref({
    ownerFactoryURL: '',
    distributionId: '',
    datasetId: '',
    accessURL: '',
    organizationId: '',
    type: '',
    price: number,
    numOfShare: number,
    numOfResell: number,
    limitNumber: number,
    limitFrequency: '',
    license: '',
    transferable: '',
    region: '',
    containsPersonalData: boolean,
    isExclusive: boolean,
});

const selected = ref<
    | {
          id: string;
          title: string;
          distributions: Record<string, any>[];
          monetization: Record<string, any>;
          offer: {
              original_id: string;
          };
      }
    | undefined
>(undefined);

watch(selected, () => {
    if (!selected.value) return;
    showValuationData.value = false;
    valuationRating.value = '';
    numberRating.value = 0;
    valuationData.value = {};

    const distribution = selected.value.distributions?.[0];
    console.log('Selected offer:\n', selected.value);
    offerMetadata.value.accessURL = distribution?.access_url?.[0];
    try {
        const url = new URL(offerMetadata.value.accessURL || '');
        offerMetadata.value.ownerFactoryURL = `${url.protocol}//${url.host}/`;
    } catch (e) {
        // ignore invalid URL
    }
    offerMetadata.value.datasetId = selected.value.offer.original_id || '';
    offerMetadata.value.distributionId = distribution?.id || '';
    offerMetadata.value.organizationId = ownFactoryOrgId;
    offerMetadata.value.type = selected.value.monetization?.[0]?.purchase_offer?.[0]?.type || '';
    offerMetadata.value.price = selected.value.monetization?.[0]?.purchase_offer?.[0]?.price || 0;
    offerMetadata.value.numOfShare = selected.value.monetization?.[0]?.purchase_offer?.[0]?.num_reshare || 999;
    offerMetadata.value.numOfResell = selected.value.monetization?.[0]?.purchase_offer?.[0]?.num_resell || 999;
    offerMetadata.value.limitNumber = selected.value.monetization?.[0]?.purchase_offer?.[0]?.limit_number || 999;
    // offerMetadata.value.limitFrequency = selected.value.monetization?.[0]?.purchase_offer?.[0]?.limit_frequency || '';
    offerMetadata.value.license = selected.value.monetization?.[0]?.purchase_offer?.[0]?.license?.label || '';
    offerMetadata.value.transferable = selected.value.monetization?.[0]?.purchase_offer?.[0]?.transferable || '';
    offerMetadata.value.region = selected.value.monetization?.[0]?.purchase_offer?.[0]?.spatial_availability || '';
    offerMetadata.value.containsPersonalData =
        selected.value.monetization?.[0]?.purchase_offer?.[0]?.personal_data_terms?.[0]?.contains_personal_data;
    offerMetadata.value.isExclusive = selected.value.monetization?.[0]?.purchase_offer?.[0]?.is_exclusive;
});

const { data: datasetsData } = useFetch<Record<string, any>[]>(`/api/datasets/get-all-foreign-offers-valuation`, {
    query: {
        nonFree: true,
    },
    server: true,
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
            distributions: dataset.distributions,
            monetization: dataset.monetization,
            offer: dataset.offer,
            modified: dataset.modified,
        })),
    );
});

const items = ref([
    { title: t('data.designer.valuation.accessibility'), value: 0.5 },
    { title: t('data.designer.valuation.availability'), value: 0.5 },
    { title: t('data.designer.valuation.format'), value: 0.5 },
    { title: t('data.designer.valuation.age'), value: 0.5 },
    { title: t('data.designer.valuation.legal'), value: 0.5 },
    { title: t('data.designer.valuation.privacy'), value: 0.5 },
    { title: t('data.designer.valuation.dqa'), value: 0.5 },
]);

const explanations = computed<Record<string, string>>(() => {
    const keys = Object.keys(valuationData.value);
    if (!keys.length) return {};

    const explanationObject: Record<string, string> = {};
    keys.forEach((key: string) => {
        explanationObject[key] = t(`data.designer.valuation.${key}Explanation`);
    });

    return explanationObject;
});

// const submitUrl = computed(() => {
//     return (route?.query?.submitUrl as string) || '';
// });

function getLabel(value: number) {
    const labels = [
        t('data.valuation.labels.notImportant'),
        t('data.valuation.labels.somewhatImportant'),
        t('data.valuation.labels.important'),
        t('data.valuation.labels.veryImportant'),
        t('data.valuation.labels.critical'),
    ];
    return labels[Math.round(value / 0.25)];
}

async function submit() {
    console.log('Selected offer:', selected.value);
    if (!selected.value) {
        console.warn('No dataset selected. Please select a dataset before submitting.');
        showNotification({
            type: 'warning',
            message: t('data.valuation.validation.noDataset'),
        });
        return;
    }

    const dvsUrl = `${offerMetadata.value.ownerFactoryURL}api/datavalue/`;
    const proxyDvsRoute = `/api/datasets/get-valuation-data`;

    const dvsPayload = {
        originalAssetId: offerMetadata.value.datasetId,
        accessUrl: offerMetadata.value.accessURL,
        organizationId: offerMetadata.value.organizationId,
        weights: items.value.reduce((acc, item) => {
            let key = item.title.toLowerCase().replace(/\s+/g, '_');
            if (key == 'data_quality') {
                key = 'dqa';
            }
            acc[key] = item.value;
            return acc;
        }, {}),
        monetization: {
            type: offerMetadata.value.type,
            price: offerMetadata.value.price,
            numOfShare: offerMetadata.value.numOfShare,
            numOfResell: offerMetadata.value.numOfResell,
            limitNumber: offerMetadata.value.limitNumber,
            // limitFrequency: offerMetadata.value.limitFrequency,
            license: offerMetadata.value.license,
            transferable: offerMetadata.value.transferable,
            region: offerMetadata.value.region,
            containsPersonalData: offerMetadata.value.containsPersonalData,
            isExclusive: offerMetadata.value.isExclusive,
        },
    };

    console.log('Submitting valuation to:', dvsUrl);
    // console.log('Submitting valuation with payload:', dvsPayload);
    console.log('Submitting valuation with payload - stringified:', JSON.stringify(dvsPayload, null, 2));

    loadingValuation.value = true;
    showValuationData.value = false;
    try {
        const response = await fetch(proxyDvsRoute, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dvsPayload, null, 2),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Submit failed:', response.status, errorText);
            return;
        }

        const data = await response.json().catch(() => null);
        console.log('Configuration submitted successfully:', data || 'no JSON response');

        const responseData = data?.data ?? data;
        if (responseData) {
            valuationRating.value = responseData.rating ?? '';
            numberRating.value = responseData.agg_score ?? 0;
            valuationData.value = {
                accessibility: responseData.accessibility_score ?? 'N/A',
                availability: responseData.availability_score ?? 'N/A',
                format: responseData.format_score ?? 'N/A',
                age: responseData.age_score ?? 'N/A',
                legal: responseData.legal_score ?? 'N/A',
                dqa: responseData.dqa_score ?? 'N/A',
            };
            showValuationData.value = true;
        }
    } catch (error) {
        console.error('Submit error:', error);
    } finally {
        loadingValuation.value = false;
    }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
