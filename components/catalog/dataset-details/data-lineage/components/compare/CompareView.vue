<template>
    <div class="container bg-body-tertiary">
        <div class="row">
            <div class="col-12">
                <div class="d-flex table-container">
                    <div class="col-6">
                        <h4>Dataset version {{ store.selectedDiff?.[0] }}</h4>
                        <table border="1">
                            <thead>
                                <tr>
                                    <th
                                        v-for="column in dataset1Columns"
                                        :key="column.name"
                                        :class="getColumnClass(column.name, 1)"
                                    >
                                        {{ column.name }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, rowIndex) in dataset1Data" :key="rowIndex">
                                    <td
                                        v-for="(value, index) in row"
                                        :key="index"
                                        :class="getClass(value, index, rowIndex, 1)"
                                    >
                                        {{ value }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="col-6">
                        <h4>Dataset version {{ store.selectedDiff?.[1] }}</h4>
                        <table border="1">
                            <thead>
                                <tr>
                                    <th
                                        v-for="column in dataset2Columns"
                                        :key="column.name"
                                        :class="getColumnClass(column.name, 2)"
                                    >
                                        {{ column.name }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, rowIndex) in dataset2Data" :key="rowIndex">
                                    <td
                                        v-for="(value, index) in row"
                                        :key="index"
                                        :class="getClass(value, index, rowIndex, 2)"
                                    >
                                        {{ value }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="py-3">Legend:</div>
            <ul>
                <li>
                    <div class="rounded-circle column-added" style="width: 10px; height: 10px; float: left"></div>
                    Added
                </li>
                <li>
                    <div class="rounded-circle blue" style="width: 10px; height: 10px; float: left"></div>
                    Changed
                </li>
                <li>
                    <div class="rounded-circle green" style="width: 10px; height: 10px; float: left"></div>
                    Columns added
                </li>
                <li>
                    <div class="rounded-circle pink" style="width: 10px; height: 10px; float: left"></div>
                    Columns removed
                </li>
            </ul>
        </div>
    </div>
    <div></div>
</template>

<script setup>
import { computed } from 'vue';

import { useStore } from '@/components/catalog/dataset-details/data-lineage/stores/store';

// ========================================
// COMPONENT SETUP
// ========================================

const store = useStore();

// ========================================
// REACTIVE DATA
// ========================================

const dataset1 = computed(() => store.diffData?.dataset_1?.[0] || null);
const dataset2 = computed(() => store.diffData?.dataset_2?.[0] || null);

const dataset1Columns = computed(() => {
    return dataset1.value?.data_model?.columns?.map((col) => col[0]) || [];
});

const dataset2Columns = computed(() => {
    return dataset2.value?.data_model?.columns?.map((col) => col[0]) || [];
});

const dataset1Data = computed(() => {
    return dataset1.value?.data?.rows || [];
});

const dataset2Data = computed(() => {
    return dataset2.value?.data?.rows || [];
});

// ========================================
// COLUMN MAPPING
// ========================================

const _columnMap = computed(() => {
    const map = {};
    if (store.diffData?.diff?.columns_changed) {
        store.diffData.diff.columns_changed.forEach((change) => {
            map[change.old] = change.new;
        });
    }
    return map;
});

// ========================================
// STYLING FUNCTIONS
// ========================================

const getClass = (value, index, rowIndex, dataset) => {
    if (!store.diffData?.diff) return '';

    const columnName = dataset === 1 ? dataset1Columns.value[index] : dataset2Columns.value[index];

    const { rows_removed, columns_changed, values_modified } = store.diffData.diff;

    // Check for removed rows (dataset 1 only)
    if (dataset === 1 && rows_removed?.length) {
        const rowData = {};
        dataset1Columns.value.forEach((col, i) => {
            rowData[col] = dataset1Data.value[rowIndex]?.[i];
        });

        const isRemovedRow = rows_removed.some((removedRow) =>
            Object.entries(removedRow).every(([key, val]) => val === null || rowData[key] === val),
        );

        if (isRemovedRow) return 'removed';
    }

    // Check for renamed columns
    if (columns_changed?.length) {
        const isOldColumn = columns_changed.some((change) => change.old === columnName);
        const isNewColumn = columns_changed.some((change) => change.new === columnName);

        if (dataset === 1 && isOldColumn) return 'modified';
        if (dataset === 2 && isNewColumn) return 'modified';
    }

    // Check for modified values
    if (values_modified?.length) {
        const isModified = values_modified.some((mod) => mod.column === columnName && mod.row === rowIndex);

        if (isModified) return 'modified';
    }

    return '';
};

const getColumnClass = (columnName, dataset) => {
    if (!store.diffData?.diff?.columns_changed) return '';

    const { columns_changed } = store.diffData.diff;
    const isOldColumn = columns_changed.some((change) => change.old === columnName);
    const isNewColumn = columns_changed.some((change) => change.new === columnName);

    if (dataset === 1 && isOldColumn) return 'column-removed';
    if (dataset === 2 && isNewColumn) return 'column-added';

    return '';
};
</script>

<style scoped>
/* ========================================
   LAYOUT & CONTAINERS
   ======================================== */

.table-container {
    gap: 1rem;
}

.table-container h2 {
    text-align: center;
}

/* ========================================
   TABLE STYLING
   ======================================== */

table {
    width: 100%;
}

th,
td {
    padding: 0.5rem;
    border: 1px solid grey;
}

thead th {
    border-bottom: 2px solid black !important;
    font-weight: 500;
    background-color: #5632d0;
    color: #fff;
    text-transform: capitalize;
}

/* ========================================
   ROW & CELL STATE COLORS
   ======================================== */

.added,
.column-added {
    background: #90ee90 !important;
    color: black;
}

.modified {
    background: #87cefa !important;
}

.removed,
.column-removed {
    background: #ffb6c1 !important;
    color: black;
}

/* ========================================
   LEGEND STYLING
   ======================================== */

ul {
    list-style: none;
}

.green {
    background: #90ee90 !important;
}

.blue {
    background: #87cefa !important;
}

.pink {
    background: #ffb6c1 !important;
}
</style>
