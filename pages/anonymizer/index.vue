<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { TableRow } from '~/interfaces/dataset-preview';
import { usePreviewStore } from '~/store/preview';

import Title from '../../components/anonymizer/Title.vue';
import { getSensitiveColumns } from './data';

const { t } = useI18n();

const title = t('anonymizer.anonymizer');

const previewStore = usePreviewStore();

const rows = ref<TableRow[]>(previewStore.tableRows);
const sensitiveColumns = ref<string[]>(getSensitiveColumns(previewStore.getReport));

previewStore.$subscribe((mutation, state) => {
    rows.value = state.tableRows;
    sensitiveColumns.value = getSensitiveColumns(state.report);
});
</script>

<template>
    <Title :title="title" />
    <div class="flex flex-row flex-wrap justify-between gap-2">
        <UCard class="xl:max-w-2xl w-full">
            <h1 class="text-2xl">Data</h1>
            <UTable :rows="rows" class="mb-3" :loading="rows.length === 0"></UTable>
            <h2 class="text-xl mb-3">Sensitivity Report</h2>
            <p v-if="sensitiveColumns.length !== 0">The following columns in this dataset were deemed sensitive:</p>
            <p v-else-if="rows.length === 0">Loading sensitivity report...</p>
            <p v-else>Congratulations! No sensitive data was found!</p>
            <ul class="ml-10 list-disc">
                <li v-for="(column, index) in sensitiveColumns" :key="index">{{ column }}</li>
            </ul>
        </UCard>

        <UCard class="xl:max-w-lg w-full">
            <div class="flex flex-col gap-4">
                <h1 class="text-2xl">Anonymization</h1>

                <h3 class="font-bold">Obfuscation</h3>
                <p>Obscure sensitive data by either removing it or masking it by replacing values.</p>
                <UButton to="/anonymizer/obfuscation">Obfuscation Utilities</UButton>

                <h3 class="font-bold">k-Anonymity</h3>
                <p>
                    Based on analysis we will select columns containing sensitive data and provide a series of solutions
                    to keep your data safe.
                </p>
                <UButton to="/anonymizer/k-anonymity">k-Anonymity</UButton>

                <h3 class="font-bold">Differential Privacy</h3>
                <p>Inject noise into your dataset so that personally identifiable information is obscured.</p>
                <UButton>Differential Privacy</UButton>
            </div>
        </UCard>
    </div>
</template>
