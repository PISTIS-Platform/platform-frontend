<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { type AnonymiserResponse, type TableRow } from '~/interfaces/dataset-preview';
import { useAnonymizerStore } from '~/store/anonymizer';

import Title from '../../components/anonymizer/Title.vue';
import { getSensitiveColumns } from './data';

/**
 * Translater for this page.
 */
const { t } = useI18n();

/**
 * Title for this page.
 */
const title = t('anonymizer.anonymizer');

/**
 * Reference to the anonymiser pinia store.
 */
const anonymizerStore = useAnonymizerStore();

/**
 * Reference to the nuxt router.
 */
const router = useRouter();

/**
 * Trigger for discard button loading animation
 */
const discardButtonLoading = ref(false);

/**
 * Trigger for apply button loading animation
 */
const applyButtonLoading = ref(false);

/**
 * Rows to be displayed in the dataset table.
 */
const rows = ref<TableRow[]>(anonymizerStore.getTableRows);

/**
 * A list of sensitive column names.
 */
const sensitiveColumns = ref<string[]>(getSensitiveColumns(anonymizerStore.getReport));

/**
 * When anonymiser store mutates state update rows, sensitive column names and file data.
 */
anonymizerStore.$subscribe((mutation, state) => {
    rows.value = state.tableRows;
    sensitiveColumns.value = getSensitiveColumns(state.report);
});

/**
 * Apply changes that the user has made in the anonymiser to the original data.
 * Routes back to home page.
 */
async function applyChanges(): Promise<void> {
    applyButtonLoading.value = true;
    const response: AnonymiserResponse<undefined> = (
        await useFetch('/api/anonymizer/dataset', {
            method: 'POST',
        })
    ).data.value as AnonymiserResponse<undefined>;

    if (response.code != 201) {
        window.alert('Something went wrong! Please try again.');
    } else {
        window.alert('Successfully applied changes!');
        router.push({ name: 'home' });
    }
    applyButtonLoading.value = false;
}

/**
 * Delete the obfuscated copy of the dataset that the user has stored in the anonymiser.
 * Routes back to home page.
 */
async function discardChanges(): Promise<void> {
    discardButtonLoading.value = true;
    const response: AnonymiserResponse<undefined> = (
        await useFetch('/api/anonymizer/dataset', {
            method: 'DELETE',
        })
    ).data.value as AnonymiserResponse<undefined>;

    if (response.code != 200) {
        window.alert('Something went wrong! Please try again.');
    } else {
        window.alert('Successfully discarded changes!');
        router.push({ name: 'home' });
    }
    discardButtonLoading.value = false;
}
</script>

<template>
    <Title :title="title" />
    <div class="flex flex-row flex-wrap justify-between gap-2">
        <UCard class="xl:max-w-2xl w-full">
            <h1 class="text-2xl">Data</h1>
            <UTable :rows="rows" class="mb-3" :loading="rows.length === 0"></UTable>
            <h2 class="text-xl mb-3">Actions</h2>
            <p>Apply changes to the original dataset or discard them.</p>
            <div class="flex flex-row flex-wrap gap-3 mt-3">
                <UButton class="w-32" :loading="applyButtonLoading" @click="applyChanges()">Apply Changes</UButton>
                <UButton class="w-36" :loading="discardButtonLoading" @click="discardChanges()"
                    >Discard Changes
                </UButton>
            </div>
            <h2 class="text-xl mb-3 mt-3">Sensitivity Report</h2>
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
                <UButton class="w-44" to="/anonymizer/obfuscation">Obfuscation Utilities</UButton>

                <h3 class="font-bold">k-Anonymity</h3>
                <p>
                    Based on analysis we will select columns containing sensitive data and apply anonymization to them.
                </p>
                <UButton class="w-44" to="/anonymizer/k-anonymity">k-Anonymity</UButton>

                <h3 class="font-bold">Synthetic Data</h3>
                <p>Replace your data with synthetic data that maintains its statistical properties.</p>
                <UButton class="w-44" to="/anonymizer/synth">Synthesize Data</UButton>
            </div>
        </UCard>
    </div>
</template>
~/store/anonymizer
