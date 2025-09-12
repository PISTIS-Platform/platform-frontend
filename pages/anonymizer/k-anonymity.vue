<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { KAnonPreview, Preview, Report, RiskMetrics, Solution, TableRow } from '~/interfaces/dataset-preview';
import { useAnonymizerStore } from '~/store/anonymizer';

import Title from '../../components/anonymizer/Title.vue';

/**
 * Translater for this page.
 */
const { t } = useI18n();

/**
 * Title of the page
 */
const title = `${t('anonymizer.kAnonymity')}`;

/**
 * Potential sensitivity classifications for each column.
 */
enum Sensitivity {
    Sensitive = 'SENSITIVE',
    Insensitive = 'INSENSITIVE',
    QuasiIdentifier = 'QUASI_IDENTIFIER',
}

/**
 * Reference to the anonymiser pinia store
 */
const anonymizerStore = useAnonymizerStore();

/**
 * Reference to the nuxt router.
 */
const router = useRouter();

/**
 * List of available numbers that are used to determine the ranges that will replace numerical values in a column.
 */
const intervals = ref([] as number[]);

/**
 * List of possible transformations.
 */
const solutions = ref([] as Solution[]);

/**
 * List of transformations that are currently displayed
 */
const displayedSolutions = ref([] as TableRow[]);

/**
 * Column names for the solutions table.
 */
const solutionColumns = ref([] as TableRow[]);

/**
 * Preview of the obfuscated dataset.
 */
const obfuscatedRows = ref([] as TableRow[]);

/**
 * Risk metrics of the obfuscation preview.
 */
const riskMetrics = ref({} as RiskMetrics);

/**
 * Current page of potential soluionts that are being displayed by the anonymiser
 */
const page = ref(1);

/**
 * Maximum number of solutions that can appear in the solutions table.
 */
const pageCount = 5;

/**
 * The data that is to be displayed by the solutions table.
 */
const displayedSolutionView = computed(() => {
    return displayedSolutions.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});

/**
 * Trigger for the solutions table loading animation.
 */
const loadingSolutions = ref(false);

/**
 * Trigger for the preview table loading animation.
 */
const loadingPreview = ref(false);

/**
 * Trigger for the anonymize button loading animation.
 */
const isAnonymizing = ref(false);

/**
 * The current solution that is being displayed by the preview table.
 */
const currentSolution = reactive({
    transformation: {} as TableRow,
    columnSensitivity: {} as TableRow,
});

/**
 * The preview of the dataset before anonymisation.
 */
const rawPreview = reactive({
    rows: anonymizerStore.getTableRows,
    columns: anonymizerStore.getMetadata.types,
    report: anonymizerStore.getReport,
    columnSensitivity: formatReport(anonymizerStore.getReport),
});

/**
 * Update the rawPreview on mutation of anonymiser pinia store state.
 */
anonymizerStore.$subscribe((mutation, state) => {
    rawPreview.rows = state.tableRows;
    rawPreview.columns = state.metadata.types;
    rawPreview.report = state.report;
    rawPreview.columnSensitivity = formatReport(state.report);

    solutions.value = [];
    solutionColumns.value = [];
    obfuscatedRows.value = [];
});

/**
 * format report so that results can be read by v-for.
 *
 * @returns a table row containing a mapping of column names to their respective sensitivities.
 */
function formatReport(report: Report) {
    let columnSensitivity: TableRow = {};

    for (const [column, columnReport] of Object.entries(report)) {
        columnSensitivity[column] = columnReport.sensitivity;
    }

    return columnSensitivity;
}

/**
 * Format a list of column names so that they can be displayed by nuxt's UTable component.
 *
 * @returns formatted table row
 */
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

/**
 * Request a list of potential solutions from the anonymiser backend
 * and load the results into all the necessary variables.
 */
async function generateSolutions() {
    //check that there is a single quasi identifier
    const sensitivities = Object.values(rawPreview.columnSensitivity);
    if (!sensitivities.includes('QUASI_IDENTIFIER')) {
        window.alert('Your dataset must contain at least one quasi identifier for k-anonymity to work!');
    } else {
        loadingSolutions.value = true;

        let response = await useFetch('/api/anonymizer/solution', {
            method: 'POST',
            body: {
                columnSensitivity: rawPreview.columnSensitivity,
            },
        });

        solutions.value = response.data.value as Solution[];
        solutionColumns.value = formatColumns(Object.keys(rawPreview.columns));
        displayedSolutions.value = formatSolutions(solutions.value, rawPreview.columns, rawPreview.columnSensitivity);
        loadingSolutions.value = false;
    }
}

/**
 * Format solutions so that they are compatible with the NuxtUI UTable component.
 *
 * @param solutions the solutions to format
 * @param columns A map of columns to their respective data type
 * @param columnSensitivity A map of columns to their respective sensitivity
 * @returns Formatted results
 */
function formatSolutions(solutions: Solution[], columns: TableRow, columnSensitivity: TableRow): TableRow[] {
    return solutions.map((solution, index) => {
        let row: TableRow = {};

        for (const [column, type] of Object.entries(columns)) {
            if (columnSensitivity[column] == Sensitivity.Sensitive) {
                row[column] = 'Delete column';
            } else if (columnSensitivity[column] == Sensitivity.QuasiIdentifier) {
                //Display appropriate text based on column type
                if (type === 'STRING') {
                    row[column] = `Remove the ${solution.transformation[column]} leftmost characters`;
                } else if (type === 'NUMBER') {
                    const interval = intervals.value[solution.transformation[column]];

                    if (interval) {
                        row[column] = `Numbers will be replaced by intervals of ${interval}`;
                    } else if (interval === 0) {
                        row[column] = 'Numbers will not be changed';
                    } else {
                        row[column] = 'Numbers will be deleted';
                    }
                } else {
                    row[column] = 'Data type not yet supported!';
                }
            } else {
                row[column] = 'No transformation';
            }
        }

        row['index'] = index;
        row['informationLoss'] = solution.informationLoss;

        return row;
    });
}

/**
 * Format a dataset as retrieved from the anonymiser k-anonymity backend.
 *
 * @param dataset Dataset from the k-anonymity backend.
 * @returns Formatted rows
 */
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

/**
 * Get a preview of a transformation from the anonymiser backend and load the result
 * into the relevant variables.
 *
 * @param transformation A mapping of column names to their anonymisation level.
 */
async function generatePreview(transformation: TableRow) {
    loadingPreview.value = true;

    let response = await useFetch('/api/anonymizer/previewSolution', {
        method: 'POST',
        body: {
            columnSensitivity: rawPreview.columnSensitivity,
            transformation: transformation,
        },
    });

    const kAnonPreview = response.data.value as KAnonPreview;
    const dataset = kAnonPreview.dataset;
    obfuscatedRows.value = formatPreview(dataset);
    currentSolution.columnSensitivity = rawPreview.columnSensitivity;
    currentSolution.transformation = transformation;

    const newRiskMetrics = kAnonPreview.riskMetrics;
    riskMetrics.value = newRiskMetrics;
    loadingPreview.value = false;
}

/**
 * Apply the current currentSolution to the dataset.
 */
async function submitObfuscation() {
    isAnonymizing.value = true;
    let response = await useFetch('/api/anonymizer/applySolution', {
        method: 'POST',
        body: currentSolution,
    });

    if (response.data.value['code'] === 200) {
        window.alert('Dataset successfully anonymized!');
    } else {
        window.alert('Something went wrong!');
    }

    //Update preview to reflect changes
    const updatedData = await useFetch('/api/anonymizer/dataset/preview');
    const data = updatedData.data.value;

    const result: Preview = data.result;
    anonymizerStore.changePreview(result);

    isAnonymizing.value = false;
    router.push({ name: 'anonymizer' });
}

/**
 * Fetch the available intervals for numeric anonymization from the backend on mount.
 */
onMounted(async () => {
    const response = await useFetch('/api/anonymizer/intervals');
    intervals.value = response.data.value;
});
</script>

<template>
    <Title :title="title" />
    <UCard class="w-full">
        <div class="w-full flex flex-col gap-5">
            <h2 class="text-2xl">Data Preview</h2>
            <UTable
                :rows="rawPreview.rows"
                :loading="rawPreview.rows.length === 0 && anonymizerStore.getPreviewFetchCode !== 404"
                :empty-state="{
                    icon: 'i-heroicons-circle-stack-20-solid',
                    label: 'No data. Please upload a dataset!',
                }"
            />

            <template v-if="anonymizerStore.getPreviewFetchCode === 200">
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
                        <!--
                    <h4 class="text-sm font-bold">Change Sensitivity:</h4>
                    <USelect v-model="rawPreview.columnSensitivity[column]" :options="Object.values(Sensitivity)" />
                    --></div>
                </div>
                <UButton class="w-36 text-center" :loading="loadingSolutions" @click="generateSolutions()"
                    >See Solutions
                </UButton>

                <div :hidden="solutions.length === 0" class="mt-3">
                    <h2 class="text-2xl">Solutions</h2>
                    <p>Below you can find a list of configurations to keep your data anonymous.</p>
                    <UTable :rows="displayedSolutionView" :columns="solutionColumns" :loading="solutions.length === 0">
                        <template #actions-data="{ row }">
                            <UButton @click="generatePreview(solutions[row.index].transformation)">Preview</UButton>
                        </template>
                    </UTable>
                    <div class="flex justify-start px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
                        <UPagination v-model="page" :page-count="pageCount" :total="displayedSolutions.length" />
                    </div>
                </div>

                <div :hidden="obfuscatedRows.length === 0 && !loadingPreview" class="mt-3">
                    <h2 class="text-2xl">Preview</h2>
                    <UTable :rows="obfuscatedRows" :loading="loadingPreview" :progress="{ animation: 'carousel' }" />
                    <div class="mt-3">
                        <h3 class="text-md font-bold">Risk of Reidentification</h3>
                        <p>The risk of reidentification after this transformation is:</p>
                        <ul class="ml-4">
                            <li>- Percentage of records at risk: {{ riskMetrics.recordsAtRisk * 100 }}%</li>
                            <li>- Highest risk of any single record: {{ riskMetrics.highestRisk * 100 }}%</li>
                            <li>
                                - The average success rate when reidentifying records is:
                                {{ riskMetrics.successRate * 100 }}%
                            </li>
                        </ul>
                    </div>
                    <UButton class="mt-4" :loading="isAnonymizing" @click="submitObfuscation()"
                        >Anonymize Dataset
                    </UButton>
                </div>
            </template>
        </div>
    </UCard>
</template>
