<script setup lang="ts">
import { onMounted, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePreviewStore } from '~/store/preview';

import Title from '../../components/anonymizer/Title.vue';
import { data, formatPreview, getSensitiveColumns } from './data';

const { t } = useI18n();

const title = t('anonymizer.anonymizer');

const previewStore = usePreviewStore();
const sensitiveColumns: Ref<string[]> = ref([]);
const rows = ref([{}]);

onMounted(() => {
    const result = data.result;
    previewStore.changeDataset(result.dataset);
    previewStore.changeMetadata(result.metadata);
    previewStore.changeReport(result.report);
    previewStore.changeTableRows(formatPreview(previewStore.getDataset));

    rows.value = previewStore.getTableRows;

    sensitiveColumns.value = getSensitiveColumns(previewStore.getReport);
});
</script>

<template>
    <Title :title="title" />
    <div class="flex flex-row flex-wrap justify-between gap-2">
        <UCard class="xl:max-w-2xl">
            <h1 class="text-2xl">Data</h1>
            <UTable :rows="rows" class="mb-3"></UTable>
            <h2 class="text-xl mb-3">Sensitivity Report</h2>
            <p>The following columns in this dataset were deemed sensitive:</p>
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
