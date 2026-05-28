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
                        class="bg-secondary-500 text-white px-3 py-2 rounded text-sm hover:bg-secondary-600"
                        @click="submit"
                    >
                        {{ t('data.valuation.submit') }}
                    </UButton>
                </div>
            </div>
        </UCard>
    </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useI18n } from '#imports';

const { t } = useI18n();
import * as R from 'ramda';

// const route = useRoute();

const notification = ref('');

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
    const distribution = selected.value.distributions?.[0];
    offerMetadata.value.accessURL = distribution?.access_url?.[0];
    try {
        const url = new URL(offerMetadata.value.accessURL || '');
        offerMetadata.value.ownerFactoryURL = `${url.protocol}//${url.host}/`;
    } catch (e) {
        // ignore invalid URL
    }
    offerMetadata.value.datasetId = selected.value.offer.original_id || '';
    offerMetadata.value.distributionId = distribution?.id || '';
    offerMetadata.value.organizationId =
        selected.value.monetization?.[0]?.purchase_offer?.[0]?.publisher?.organization_id || '';
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

    const dvsPayload = {
        originalAssetId: offerMetadata.value.datasetId,
        distributionId: offerMetadata.value.distributionId,
        organizationId: offerMetadata.value.organizationId,
        weights: items.value.reduce((acc, item) => {
            let key = item.title.toLowerCase().replace(/\s+/g, '_');
            if (key == 'data_quality') {
                key = 'dqa';
            }
            acc[key] = item.value;
            return acc;
        }, {}),
    };

    console.log('Submitting valuation to:', dvsUrl);
    // console.log('Submitting valuation with payload:', dvsPayload);
    console.log('Submitting valuation with payload - stringified:', JSON.stringify(dvsPayload, null, 2));

    try {
        const response = await fetch(dvsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dvsPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Submit failed:', response.status, errorText);
            return;
        }

        const data = await response.json().catch(() => null);
        console.log('Configuration submitted successfully:', data || 'no JSON response');
    } catch (error) {
        console.error('Submit error:', error);
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
