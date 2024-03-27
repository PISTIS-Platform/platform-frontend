<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { TableRow } from '~/interfaces/dataset-preview';
import { SortedMasks } from '~/interfaces/mask-settings';
import { usePreviewStore } from '~/store/preview';

import Title from '../../components/anonymizer/Title.vue';

const { t } = useI18n();

const title: string = `${t('anonymizer.anonymizer')} - ${t('anonymizer.obfuscation')}`;
const previewStore = usePreviewStore();

previewStore.$subscribe((mutation, state) => {
    rows.value = state.tableRows;
    columns.value = state.metadata.types;
    recommendation.value = state.metadata.recommendation;
});

const rows = ref<TableRow[]>(previewStore.tableRows);
const columns = ref(previewStore.metadata.types);
const recommendation = ref(previewStore.metadata.recommendation);

//Masks sorted by applicable data type
const masksAreLoaded = ref<boolean>(false);
const masks = ref<SortedMasks>({ STRING: [], NUMBER: [] });

//Get list of available masks from the anonymizer
async function loadAvailableMasks(): Promise<SortedMasks> {
    const response = await useFetch('/api/anonymizer/mask');
    const masks = response.data.value;
    return masks.result;
}

onMounted(async () => {
    masks.value = await loadAvailableMasks();
    masksAreLoaded.value = true;
});
</script>

<template>
    <Title :title="title" />
    <UCard class="w-full">
        <div class="w-full flex flex-col gap-5">
            <h2 class="text-2xl">Data Preview</h2>
            <UTable :rows="rows" />

            <h2 class="text-2xl">Obfuscation Settings</h2>
            <div v-if="masksAreLoaded" class="w-full flex overflow-x-scroll gap-2 pb-5">
                <MaskTile
                    v-for="(type, column) in columns"
                    :key="column"
                    :column="column"
                    :masks="masks[type]"
                    :default="recommendation[column]"
                />
            </div>
            <h1 v-else>Masks are loading...</h1>
        </div>
    </UCard>
</template>
