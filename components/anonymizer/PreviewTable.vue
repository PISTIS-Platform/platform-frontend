<script setup lang="ts">
import type { TableRow } from '~/interfaces/dataset-preview';
import { useAnonymizerStore } from '~/store/anonymizer';

const anonymizerStore = useAnonymizerStore();
const rows = ref<TableRow[]>(anonymizerStore.getTableRows);

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
