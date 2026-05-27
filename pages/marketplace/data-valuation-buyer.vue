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
import { useRoute } from 'vue-router';

import { useI18n } from '#imports';

const { t } = useI18n();
import * as R from 'ramda';

const route = useRoute();

const dataValuationPayload = ref({
    ownerFactoryURL: '',
    distributionId: '',
    datasetId: '',
    accessURL: '',
});

const selected = ref<
    | {
          id: string;
          title: string;
          description: string;
          distributions: Record<string, any>[];
      }
    | undefined
>(undefined);

watch(selected, () => {
    if (!selected.value) return;
    const distribution = selected.value.distributions?.[0];
    dataValuationPayload.value.accessURL = distribution?.access_url?.[0];
    try {
        const url = new URL(dataValuationPayload.value.accessURL || '');
        dataValuationPayload.value.ownerFactoryURL = `${url.protocol}//${url.host}/`;
    } catch (e) {
        // ignore invalid URL
    }
});

const { data: datasetsData } = useFetch<Record<string, any>[]>(`/api/datasets/get-all-foreign-offers`, {
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
            description: dataset.description.en,
            distributions: dataset.distributions,
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

const submitUrl = computed(() => {
    return (route?.query?.submitUrl as string) || '';
});

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
    const url = submitUrl.value;
    if (!url) {
        console.warn('No submitUrl provided. Add ?submitUrl=<target> to the route.');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: items.value }),
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

<!--style scoped>
.data-valuation-config {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.slider-container {
  margin-bottom: 20px;
}
.slider-container label {
  display: block;
  margin-bottom: 5px;
}
.slider-container input {
  width: 100%;
}
.slider-container span {
  display: block;
  margin-top: 5px;
  font-weight: bold;
}
button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style-->

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
