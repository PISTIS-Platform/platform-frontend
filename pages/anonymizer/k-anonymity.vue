<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Preview, Report, Solution, TableRow } from '~/interfaces/dataset-preview';
import { useAnonymizerStore } from '~/store/anonymizer';

import Title from '../../components/anonymizer/Title.vue';

const { t } = useI18n();

const title = `${t('anonymizer.anonymizer')} - ${t('anonymizer.kAnonymity')}`;

enum Sensitivity {
    Sensitive = 'SENSITIVE',
    Insensitive = 'INSENSITIVE',
    QuasiIdentifier = 'QUASI_IDENTIFIER',
}

const anonymizerStore = useAnonymizerStore();
const solutions = ref([] as Solution[]);
const solutionColumns = ref([] as TableRow[]);
const obfuscatedRows = ref([] as TableRow[]);
const loadingSolutions = ref(false);
const loadingPreview = ref(false);
const isAnonymizing = ref(false);

const currentSolution = reactive({
    transformation: {} as TableRow,
    columnSensitivity: {} as TableRow,
});

//Preview before anonymization
const rawPreview = reactive({
    rows: anonymizerStore.getTableRows,
    columns: anonymizerStore.getMetadata.types,
    report: anonymizerStore.getReport,
    columnSensitivity: formatReport(anonymizerStore.getReport),
});

anonymizerStore.$subscribe((mutation, state) => {
    rawPreview.rows = state.tableRows;
    rawPreview.columns = state.metadata.types;
    rawPreview.report = state.report;
    rawPreview.columnSensitivity = formatReport(state.report);

    solutions.value = [];
    solutionColumns.value = [];
    obfuscatedRows.value = [];
});

//format report so that results can be read by v-for
function formatReport(report: Report) {
    let columnSensitivity: TableRow = {};

    for (const [column, columnReport] of Object.entries(report)) {
        columnSensitivity[column] = columnReport.sensitivity;
    }

    return columnSensitivity;
}

//format column names for UTable component
function formatColumns(columns: string[]): TableRow[] {
    const formattedColumns = [
        {
            key: 'actions',
            label: 'Action',
        },
        {
            key: 'informationLoss',
            label: 'Information Loss',
        },
    ] as TableRow[];

    columns.forEach((column) => {
        formattedColumns.push({
            key: column,
            label: column,
        });
    });

    return formattedColumns;
}

// request list of solutions from the server
async function generateSolutions() {
    loadingSolutions.value = true;

    //Fetch a preview of the obfuscation
    let response = await useFetch('/api/anonymizer/solution', {
        method: 'POST',
        body: {
            columnSensitivity: rawPreview.columnSensitivity,
        },
    });

    solutions.value = response.data.value as Solution[];
    solutionColumns.value = formatColumns(Object.keys(solutions.value[0].transformation));
    loadingSolutions.value = false;
}

//format solution from the server for UTable component
function formatSolutions(solutions: Solution[]): TableRow[] {
    return solutions.map((solution) => {
        return Object.assign(solution.transformation, { informationLoss: solution.informationLoss });
    });
}

//format obfuscated preview for UTable component
function formatPreview(dataset: string[][]): TableRow[] {
    let rows = [] as TableRow[];

    //for each row
    for (let i = 1; i < dataset.length; i++) {
        let row = {} as TableRow;

        //for each column
        for (let j = 0; j < dataset[i].length; j++) {
            row[dataset[0][j]] = dataset[i][j];
        }
        rows.push(row);
    }

    return rows;
}

async function generatePreview(row: TableRow) {
    loadingPreview.value = true;

    let tempRow = { ...row };
    delete tempRow['informationLoss'];
    let response = await useFetch('/api/anonymizer/previewSolution', {
        method: 'POST',
        body: {
            columnSensitivity: rawPreview.columnSensitivity,
            transformation: tempRow,
        },
    });

    const preview = response.data.value as string[][];
    obfuscatedRows.value = formatPreview(preview);
    currentSolution.columnSensitivity = rawPreview.columnSensitivity;
    currentSolution.transformation = tempRow;
    loadingPreview.value = false;
}

async function submitObfuscation() {
    isAnonymizing.value = true;
    let response = await useFetch('/api/anonymizer/applySolution', {
        method: 'POST',
        body: currentSolution,
    });

    console.log(response.data.value);

    if (response.data.value['code'] === 200) {
        window.alert('Dataset successfully anonymized!');
    } else {
        window.alert('Something went wrong!');
    }

    //Update preview to reflect changes
    const updatedData = await useFetch('/api/anonymizer/preview');
    const data = updatedData.data.value;

    const result: Preview = data.result;
    anonymizerStore.changePreview(result);

    isAnonymizing.value = false;
}
</script>

<template>
    <Title :title="title" />
    <UCard class="w-full">
        <div class="w-full flex flex-col gap-5">
            <h2 class="text-2xl">Data Preview</h2>
            <UTable :rows="rawPreview.rows" :loading="rawPreview.rows.length === 0" />

            <h2 class="text-2xl">Sensitivity Settings</h2>
            <div class="w-full flex overflow-x-scroll gap-2 pb-5">
                <div
                    v-for="(columnReport, column) in rawPreview.columnSensitivity"
                    :key="column"
                    class="flex flex-col gap-1 min-w-[17rem] border p-2 rounded-md shadow-md bg-pistis-50"
                >
                    <h3 class="text-md font-bold">{{ column }}</h3>
                    <h4 class="text-sm font-bold">Predicted Sensitivity:</h4>
                    <p>{{ rawPreview.report[column].sensitivity }}</p>
                    <h4 class="text-sm font-bold">Change Sensitivity:</h4>
                    <USelect v-model="rawPreview.columnSensitivity[column]" :options="Object.values(Sensitivity)" />
                </div>
            </div>
            <UButton class="w-36 text-center" :loading="loadingSolutions" @click="generateSolutions()"
                >See Solutions
            </UButton>

            <div :hidden="solutions.length === 0" class="mt-3">
                <h2 class="text-2xl">Solutions</h2>
                <UTable :rows="formatSolutions(solutions)" :columns="solutionColumns" :loading="solutions.length === 0">
                    <template #actions-data="{ row }">
                        <UButton @click="generatePreview(row)">Preview</UButton>
                    </template>
                </UTable>
            </div>

            <div :hidden="obfuscatedRows.length === 0 && !loadingPreview" class="mt-3">
                <h2 class="text-2xl">Preview</h2>
                <UTable :rows="obfuscatedRows" :loading="loadingPreview" :progress="{ animation: 'carousel' }" />
                <UButton class="mt-4" :loading="isAnonymizing" @click="submitObfuscation()">Anonymize Dataset</UButton>
            </div>
        </div>
    </UCard>
</template>
