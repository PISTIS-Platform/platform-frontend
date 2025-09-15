<script setup lang="ts">
import type { TableRow } from '~/interfaces/dataset-preview';
import { useAnonymizerStore } from '~/store/anonymizer';

/**
 * Reference to the anonymiser pinia store
 */
const anonymizerStore = useAnonymizerStore();

/**
 * Stores all rows that are displayed in the table
 */
const rows = ref<TableRow[]>(anonymizerStore.getTableRows);

/**
 * Listens for changes in the anonymiser store and updates table rows if any are detected
 */
anonymizerStore.$subscribe((mutation, state) => {
    rows.value = state.tableRows;
});
</script>

<template>
    <UTable
        :rows="rows"
        :loading="rows.length === 0 && anonymizerStore.getPreviewFetchCode !== 404"
        :empty-state="{
            icon: 'i-heroicons-circle-stack-20-solid',
            label: 'No data. Please upload a dataset!',
        }"
    ></UTable>
</template>
