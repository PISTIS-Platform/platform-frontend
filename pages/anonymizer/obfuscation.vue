<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { usePreviewStore } from '~/store/preview';

import Title from '../../components/anonymizer/Title.vue';

const { t } = useI18n();

const title = `${t('anonymizer.anonymizer')} - ${t('anonymizer.obfuscation')}`;
const previewStore = usePreviewStore();

previewStore.$subscribe((mutation, state) => {
    rows.value = state.tableRows;
    columns.value = state.columns;
});

const rows = ref(previewStore.tableRows);
const columns = ref(previewStore.columns);
</script>

<template>
    <Title :title="title" />
    <UCard class="w-full">
        <div class="w-full flex flex-col gap-5">
            <h2 class="text-2xl">Data Preview</h2>
            <UTable :rows="rows" />

            <h2 class="text-2xl">Obfuscation Settings</h2>
            <div class="w-full flex overflow-x-scroll gap-2">
                <MaskTile v-for="(column, index) in columns" :key="index" :column="column" />
            </div>
        </div>
    </UCard>
</template>
