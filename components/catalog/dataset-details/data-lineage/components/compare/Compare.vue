<template>
    <div class="compare-container">
        <h4 class="compare-title">Compare Dataset Versions{{ getVersionTitle }}</h4>

        <div v-if="store.selectedDiff.length < 2" class="instructions-panel">
            <div class="instructions-card">
                <h4>How to Compare Versions</h4>
                <p>To compare two dataset versions:</p>
                <ol>
                    <li>Click on any two dataset nodes in the dataset family tree</li>
                    <li>Click anywhere outside the tree to reset your selections</li>
                </ol>
                <div class="selection-status">
                    Selected versions: <strong>{{ store.selectedDiff.length }} of 2</strong>
                </div>
                <button v-if="store.selectedDiff.length === 1" class="reset-button" @click="store.resetDiff">
                    Reset Selection
                </button>
            </div>
        </div>

        <!-- Show selection message only if we're not actively comparing yet -->
        <div v-else-if="store.selectedDiff.length === 2 && !isComparing" class="comparison-panel">
            <div class="success-card">
                <h4>Versions Selected</h4>
                <p>You've selected two versions for comparison.</p>
                <div class="button-group">
                    <button class="reset-button" @click="store.resetDiff">Reset Selection</button>
                    <button class="compare-button" @click="compareVersions">Compare</button>
                </div>
            </div>
        </div>

        <!-- Active comparison section -->
        <div v-else-if="store.selectedDiff.length === 2 && isComparing" class="comparison-panel">
            <!-- Loading state -->
            <div v-if="store.isLoadingDiff" class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Fetching comparison data...</p>
            </div>

            <!-- Error state -->
            <div v-else-if="store.diffError" class="error-card">
                <h4>Error</h4>
                <p>{{ store.diffError }}</p>
                <button class="retry-button" @click="compareVersions">Retry</button>
            </div>

            <!-- Comparison content -->
            <div v-else-if="store.diffData">
                <!-- Summary section - Always visible in both factory and cloud mode -->
                <div class="comparison-summary">
                    <div class="d-flex gap-2 pt-1 px-3">
                        <div class="summary-item columns-added">
                            <span class="badge bg-success">Cols +</span>
                            <span class="count">{{
                                store.diffData?.diff?.schema_changes?.columns_added?.length || 0
                            }}</span>
                        </div>
                        <div class="summary-item columns-removed">
                            <span class="badge bg-danger">Cols -</span>
                            <span class="count">{{
                                store.diffData?.diff?.schema_changes?.columns_removed?.length || 0
                            }}</span>
                        </div>
                        <div class="summary-item columns-renamed">
                            <span class="badge bg-info">Cols Δ</span>
                            <span class="count">{{
                                store.diffData?.diff?.schema_changes?.columns_changed?.length || 0
                            }}</span>
                        </div>
                        <div class="summary-item rows-added">
                            <span class="badge bg-success">Rows +</span>
                            <span class="count">{{ store.diffData?.diff?.data_changes?.rows_added?.length || 0 }}</span>
                        </div>
                        <div class="summary-item rows-removed">
                            <span class="badge bg-danger">Rows -</span>
                            <span class="count">{{
                                store.diffData?.diff?.data_changes?.rows_removed?.length || 0
                            }}</span>
                        </div>
                        <div class="summary-item values-modified">
                            <span class="badge bg-info">Values Δ</span>
                            <span class="count">{{
                                store.diffData?.diff?.data_changes?.values_modified?.length || 0
                            }}</span>
                        </div>
                    </div>
                </div>

                <!-- Data comparison table -->
                <div class="data-comparison">
                    <!-- Pagination Controls - Top -->
                    <div v-if="ready && totalRows > rowsPerPage" class="pagination-container">
                        <div class="pagination-info">
                            <span
                                >Showing {{ (currentPage - 1) * rowsPerPage + 1 }} to
                                {{ Math.min(currentPage * rowsPerPage, totalRows) }} of {{ totalRows }} rows</span
                            >
                        </div>

                        <div class="pagination-controls">
                            <!-- Rows per page selector -->
                            <div class="rows-per-page">
                                <label for="rowsPerPage">Rows per page:</label>
                                <select
                                    id="rowsPerPage"
                                    :value="rowsPerPage"
                                    class="form-select form-select-sm"
                                    @change="changeRowsPerPage(parseInt($event.target.value))"
                                >
                                    <option v-for="option in rowsPerPageOptions" :key="option" :value="option">
                                        {{ option }}
                                    </option>
                                </select>
                            </div>

                            <!-- Page navigation -->
                            <div class="page-navigation">
                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    :disabled="currentPage === 1"
                                    @click="prevPage"
                                >
                                    Previous
                                </button>

                                <span class="page-info"> Page {{ currentPage }} of {{ totalPages }} </span>

                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    :disabled="currentPage === totalPages"
                                    @click="nextPage"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Comparison table with highlighting -->
                    <section v-if="ready" class="comparison-container">
                        <table class="comparison-table">
                            <thead>
                                <tr>
                                    <th
                                        v-for="(column, index) in columnNames"
                                        :key="index"
                                        :class="isColumnAddedOrRemoved(column)"
                                    >
                                        <template v-if="isColumnAdded(column)">
                                            <div class="added-column">
                                                <span class="added-name">{{ column }}</span>
                                            </div>
                                        </template>
                                        <template v-else-if="isColumnRenamed(column)">
                                            <div class="renamed-column">
                                                <span class="old-name">{{ column }}</span>
                                                <span class="arrow">→</span>
                                                <span class="new-name">{{ getNewColumnName(column) }}</span>
                                            </div>
                                        </template>
                                        <template v-else>
                                            {{ column }}
                                        </template>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(row, rowIndex) in paginatedRows"
                                    :key="rowIndex"
                                    :class="getRowStatusClass(row)"
                                >
                                    <td
                                        v-for="(column, colIndex) in columnNames"
                                        :key="colIndex"
                                        :class="getCellClasses(row, column)"
                                    >
                                        <template v-if="isSpecificFieldChanged(row, column)">
                                            <div class="changed-value">
                                                <span class="old-value">{{
                                                    getChangedCellValues(row, column)[0]
                                                }}</span>
                                                <span class="arrow">→</span>
                                                <span class="new-value">{{
                                                    getChangedCellValues(row, column)[1]
                                                }}</span>
                                            </div>
                                        </template>
                                        <template
                                            v-else-if="
                                                isColumnRemoved(column) &&
                                                getValueForRemovedColumn(row, column) !== null
                                            "
                                        >
                                            {{ getValueForRemovedColumn(row, column) }}
                                        </template>
                                        <template v-else>
                                            {{ row._added ? getAddedRowValue(row, column) : row[column] }}
                                        </template>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <!-- Cloud mode notice - moved below table -->
                    <div v-if="cloudMode && ready" class="mt-3 ms-2">
                        <small class="text-muted">
                            <em
                                >Note: This table shows a sample of changes between
                                {{ getDatasetNames.dataset1Name }} and {{ getDatasetNames.dataset2Name }}. Purchase the
                                full datasets to view complete differences.</em
                            >
                        </small>
                    </div>

                    <!-- Loading message when not ready -->
                    <section v-if="isComparing && store.isLoadingDiff" class="loading-container">
                        <div class="loading-spinner"></div>
                        <p class="loading-text">Loading comparison data...</p>
                    </section>

                    <!-- No data message - only show if not ready and not loading -->
                    <div v-else-if="!ready && !store.isLoadingDiff" class="alert alert-info">
                        <p>No data available for comparison.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import { useStore } from '@/components/catalog/dataset-details/data-lineage/stores/store';

const _props = defineProps({
    cloudMode: {
        type: Boolean,
        default: false,
    },
});

const store = useStore();
const isComparing = ref(false);

const currentPage = ref(1);
const rowsPerPage = ref(50);
const rowsPerPageOptions = [25, 50, 100, 200];

const getVersionTitle = computed(() => {
    if (store.selectedDiff.length === 2 && store.tableData) {
        const firstVersion = store.tableData[store.selectedDiff[0]]?.version;
        const secondVersion = store.tableData[store.selectedDiff[1]]?.version;
        if (firstVersion && secondVersion) {
            return ` (v${firstVersion} → v${secondVersion})`;
        }
    }
    return '';
});

const _getVersionInfo = (id) => {
    return store.tableData ? store.tableData[id] : null;
};

const getDatasetNames = computed(() => {
    if (store.selectedDiff.length === 2 && store.tableData) {
        const dataset1Info = store.tableData[store.selectedDiff[0]];
        const dataset2Info = store.tableData[store.selectedDiff[1]];

        const dataset1Name = dataset1Info ? `Version ${dataset1Info.version}` : 'Dataset A';
        const dataset2Name = dataset2Info ? `Version ${dataset2Info.version}` : 'Dataset B';

        return { dataset1Name, dataset2Name };
    }
    return { dataset1Name: 'Dataset A', dataset2Name: 'Dataset B' };
});

// Computed property to check if there's data to compare
const _hasDataToCompare = computed(() => {
    if (!store.diffData || !store.diffData.diff) return false;

    return (
        (store.diffData.diff.data_changes.rows_added && store.diffData.diff.data_changes.rows_added.length > 0) ||
        (store.diffData.diff.data_changes.rows_removed && store.diffData.diff.data_changes.rows_removed.length > 0) ||
        (store.diffData.diff.data_changes.values_modified &&
            store.diffData.diff.data_changes.values_modified.length > 0)
    );
});

// Get columns from the first dataset (assuming both datasets have same/similar structure)
const _columns = computed(() => {
    if (
        !store.diffData ||
        !store.diffData.dataset_1 ||
        !store.diffData.dataset_1[0] ||
        !store.diffData.dataset_1[0].data_model
    )
        return [];
    return store.diffData.dataset_1[0].data_model.columns.map((col) => col[0]) || [];
});

// Computed property to get column names from both datasets including added/removed columns
const columnNames = computed(() => {
    if (!store.diffData) return [];

    let allColumns = [];

    // Get columns from both datasets
    const columnsAdded = store.diffData.diff?.schema_changes?.columns_added || [];
    const columnsRemoved = store.diffData.diff?.schema_changes?.columns_removed || [];

    // Standard case: Get columns from dataset_1
    if (store.diffData.dataset_1 && store.diffData.dataset_1[0] && store.diffData.dataset_1[0].data_model) {
        const columns = store.diffData.dataset_1[0].data_model.columns || [];

        if (columns.length > 0) {
            if (Array.isArray(columns[0])) {
                // Format: [["column_name", "column_type"], ...]
                allColumns = columns.map((col) => col[0]);
            } else if (typeof columns[0] === 'object') {
                // Format: [{name: "column_name", dataType: "column_type"}, ...]
                allColumns = columns.map((col) => col.name);
            }
        }
    }

    // If we have a complete column replacement scenario, we need to make sure
    // removed columns are still included
    if (columnsRemoved.length > 0) {
        // Add any removed columns that aren't already in the list
        const missingRemovedColumns = columnsRemoved.filter((col) => !allColumns.includes(col));
        if (missingRemovedColumns.length > 0) {
            allColumns = [...allColumns, ...missingRemovedColumns];
        }
    }

    // Add columns that are marked as added (from dataset_2) but aren't already in the list
    if (columnsAdded.length > 0) {
        const newColumns = columnsAdded.filter((col) => !allColumns.includes(col));
        allColumns = [...allColumns, ...newColumns];
    }

    return allColumns;
});

// ========================================
// DATA PROCESSING FUNCTIONS
// ========================================

// Helper function to build column mappings for datasets
const buildColumnMappings = () => {
    const dataset1ColumnMap = new Map();
    const dataset2ColumnMap = new Map();

    // Build dataset_1 column mapping
    if (store.diffData.dataset_1?.[0]?.data_model?.columns) {
        const columns = store.diffData.dataset_1[0].data_model.columns;
        if (columns.length > 0) {
            if (Array.isArray(columns[0])) {
                columns.forEach((col, idx) => dataset1ColumnMap.set(idx, col[0]));
            } else if (typeof columns[0] === 'object') {
                columns.forEach((col, idx) => dataset1ColumnMap.set(idx, col.name));
            }
        }
    }

    // Build dataset_2 column mapping
    if (store.diffData.dataset_2?.[0]?.data_model?.columns) {
        const columns = store.diffData.dataset_2[0].data_model.columns;
        if (columns.length > 0) {
            if (Array.isArray(columns[0])) {
                columns.forEach((col, idx) => dataset2ColumnMap.set(idx, col[0]));
            } else if (typeof columns[0] === 'object') {
                columns.forEach((col, idx) => dataset2ColumnMap.set(idx, col.name));
            }
        }
    }

    return { dataset1ColumnMap, dataset2ColumnMap };
};

// Helper function to preprocess row change data
const preprocessRowChanges = () => {
    const removedRowsSet = new Set();
    const addedRowsSet = new Set();
    const removedRows = new Map();

    // Process removed rows
    if (store.diffData.diff?.data_changes?.rows_removed) {
        store.diffData.diff.data_changes.rows_removed.forEach((row) => {
            const entryId = row._entry_id || row.entry_id;
            if (entryId) {
                removedRowsSet.add(entryId);
                removedRows.set(entryId, row);
            }
        });
    }

    // Process added rows
    if (store.diffData.diff?.data_changes?.rows_added) {
        store.diffData.diff.data_changes.rows_added.forEach((row) => {
            const entryId = row._entry_id || row.entry_id;
            if (entryId) {
                addedRowsSet.add(entryId);
            }
        });
    }

    return { removedRowsSet, addedRowsSet, removedRows };
};

// Helper function to build dataset_2 rows map
const buildDataset2RowsMap = (dataset2ColumnMap) => {
    const dataset2RowsMap = new Map();

    if (store.diffData.dataset_2?.[0]?.data?.rows) {
        const dataset = store.diffData.dataset_2[0];
        dataset.data.rows.forEach((rowArray) => {
            const rowObj = {};

            // Map array values to column names
            rowArray.forEach((value, idx) => {
                const colName = dataset2ColumnMap.get(idx);
                if (colName) {
                    rowObj[colName] = value;
                }
            });

            // Store using the ID value as key (assuming first column is ID)
            const idColumnName = dataset2ColumnMap.get(0);
            if (idColumnName && rowObj[idColumnName] != null) {
                dataset2RowsMap.set(String(rowObj[idColumnName]), rowObj);
            }
        });
    }

    return dataset2RowsMap;
};

// Helper function to process dataset_1 rows
const processDataset1Rows = (dataset1ColumnMap, dataset2RowsMap, addedColumns, removedRows, dataset1EntryIds) => {
    const rows = [];

    if (!store.diffData.dataset_1?.[0]?.data?.rows) return rows;

    const dataset = store.diffData.dataset_1[0];

    dataset.data.rows.forEach((rowArray) => {
        const rowObj = {};

        // Map array values to column names
        rowArray.forEach((value, idx) => {
            const colName = dataset1ColumnMap.get(idx);
            if (colName) {
                rowObj[colName] = value;
            }
        });

        // Add removed columns if needed
        if (store.diffData.diff?.schema_changes?.columns_removed) {
            store.diffData.diff.schema_changes.columns_removed.forEach((removedCol) => {
                if (!(removedCol in rowObj)) {
                    rowObj[removedCol] = '';
                }
            });
        }

        // Mark as dataset_1 and set entry ID
        rowObj._dataset = 'dataset_1';
        const idColumnName = dataset1ColumnMap.get(0);
        let entryId = null;

        if (idColumnName && rowObj[idColumnName] != null) {
            entryId = rowObj[idColumnName];
            rowObj._entry_id = entryId;
            dataset1EntryIds.add(entryId);

            // Add values for added columns from dataset_2
            if (addedColumns.length > 0) {
                const dataset2Row = dataset2RowsMap.get(String(entryId));
                addedColumns.forEach((addedCol) => {
                    rowObj[addedCol] = dataset2Row?.[addedCol] || '';
                });
            }

            // Check if row is removed
            if (removedRows.has(entryId)) {
                rowObj._removed = true;
            }
        }

        rows.push(rowObj);
    });

    return rows;
};

// Helper function to process added rows
const processAddedRows = () => {
    const rows = [];

    if (!store.diffData.diff?.data_changes?.rows_added) return rows;

    // Create column name mapping for renamed columns
    const columnNameMap = {};
    if (store.diffData.diff?.schema_changes?.columns_changed) {
        store.diffData.diff.schema_changes.columns_changed.forEach((change) => {
            columnNameMap[change.new] = change.old;
        });
    }

    store.diffData.diff.data_changes.rows_added.forEach((row) => {
        const rowObj = { _added: true, _dataset: 'dataset_2' };

        // Set entry_id
        rowObj._entry_id = row._entry_id || row.entry_id;

        // Map values from new column names to old column names
        Object.entries(row).forEach(([key, value]) => {
            const oldColumnName = columnNameMap[key] || key;
            rowObj[oldColumnName] = value;
        });

        // Add empty values for removed columns
        if (store.diffData.diff?.schema_changes?.columns_removed) {
            store.diffData.diff.schema_changes.columns_removed.forEach((removedCol) => {
                if (!(removedCol in rowObj)) {
                    rowObj[removedCol] = '';
                }
            });
        }

        rows.push(rowObj);
    });

    return rows;
};

// Main function to get formatted rows from both datasets
const getFormattedRows = () => {
    if (!store.diffData) return [];

    const allRows = [];
    const dataset1EntryIds = new Set();

    // Get preprocessing data
    const { _removedRowsSet, _addedRowsSet, removedRows } = preprocessRowChanges();
    const { dataset1ColumnMap, dataset2ColumnMap } = buildColumnMappings();

    // Get added columns info
    const addedColumns = store.diffData.diff?.schema_changes?.columns_added || [];

    // Build dataset_2 rows map for lookup
    const dataset2RowsMap = buildDataset2RowsMap(dataset2ColumnMap);

    // Process dataset_1 rows
    const dataset1Rows = processDataset1Rows(
        dataset1ColumnMap,
        dataset2RowsMap,
        addedColumns,
        removedRows,
        dataset1EntryIds,
    );
    allRows.push(...dataset1Rows);

    // Process added rows
    const addedRows = processAddedRows();
    allRows.push(...addedRows);

    return allRows;
};

// Helper function to create a signature for a row based on its values
const _createRowSignature = (row) => {
    // Create a stable signature that can be used for comparing rows
    // Include only data fields (not metadata like _dataset)
    const dataFields = Object.entries(row)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, value]) => {
            // Normalize the value: convert null to empty string, trim, convert to string
            const normalizedValue = value === null || value === undefined ? '' : String(value).trim();
            return [key, normalizedValue];
        })
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    // Create a string signature from the fields
    const signature = dataFields.map(([key, value]) => `${key}:${value}`).join('|');
    return signature;
};

// Helper function specifically for identifying removed rows based on the sample data pattern
const isRowMatchingRemoved = (row, removedRow) => {
    // Get potential matching fields - we need to check the actual available fields
    // in each row instead of hardcoding column names
    const rowFields = Object.keys(row).filter((key) => !key.startsWith('_'));
    const removedFields = Object.keys(removedRow);

    // Get intersection of fields present in both objects
    const keysToCheck = rowFields.filter((key) => removedFields.includes(key));

    // Required minimum number of matching fields to consider it a match
    const minMatchingFields = 2;

    // Count the number of matching fields
    let matchCount = 0;

    for (const key of keysToCheck) {
        // Normalize values for comparison - treat null and empty string as equivalent
        const rowValue = row[key] === null || row[key] === undefined ? '' : String(row[key]).trim();
        const removedValue =
            removedRow[key] === null || removedRow[key] === undefined ? '' : String(removedRow[key]).trim();

        if (rowValue === removedValue) {
            matchCount++;
        }
    }

    // Consider it a match if we have enough matching fields
    const isMatch = matchCount >= Math.min(minMatchingFields, keysToCheck.length);

    return isMatch;
};

// Computed property for combined rows from both datasets
const combinedRows = computed(() => {
    return getFormattedRows();
});

// ========================================
// PAGINATION LOGIC
// ========================================
const totalRows = computed(() => combinedRows.value.length);
const totalPages = computed(() => Math.ceil(totalRows.value / rowsPerPage.value));

const paginatedRows = computed(() => {
    const startIndex = (currentPage.value - 1) * rowsPerPage.value;
    const endIndex = startIndex + rowsPerPage.value;
    return combinedRows.value.slice(startIndex, endIndex);
});

// Pagination methods
const _goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const changeRowsPerPage = (newRowsPerPage) => {
    rowsPerPage.value = newRowsPerPage;
    currentPage.value = 1; // Reset to first page when changing page size
};

// Reset pagination when new comparison data is loaded
watch(
    () => store.diffData,
    () => {
        currentPage.value = 1;
    },
);

// ========================================
// STYLING & CLASSIFICATION FUNCTIONS
// ========================================

// Helper function to determine row status class
const getRowStatusClass = (row) => {
    if (!store.diffData || !store.diffData.diff) return '';

    // If row is marked as added (from dataset_2)
    if (row._added) {
        return 'row-added';
    }

    // If row is marked as removed (directly from getFormattedRows)
    if (row._removed) {
        return 'row-removed';
    }

    // Check if this row was removed using the row-comparison approach
    if (isRowRemoved(row)) {
        return 'row-removed';
    }

    return '';
};

// Helper function to get combined cell classes
const getCellClasses = (row, columnName) => {
    const classes = [];

    // Add column-specific classes first (these take precedence)
    if (isColumnAdded(columnName)) {
        classes.push('column-added');

        // For added columns in rows that aren't new, highlight the value
        if (!row._added && row[columnName] !== undefined && row[columnName] !== null && row[columnName] !== '') {
            classes.push('cell-added-value');
        }
        // For added columns with no value
        else if (!row._added && (row[columnName] === undefined || row[columnName] === null || row[columnName] === '')) {
            classes.push('empty-cell');
        }

        return classes; // Added columns always have green background, no need for other classes
    }

    if (isColumnRemoved(columnName)) {
        classes.push('column-removed');
        return classes; // Removed columns always have red background, no need for other classes
    }

    // If row is added or removed, don't add cell-specific classes
    if (row._added || isRowRemoved(row)) {
        return classes;
    }

    // Add cell-specific classes for changed fields
    if (isSpecificFieldChanged(row, columnName)) {
        classes.push('cell-changed');
    }

    return classes;
};

// Get schema changes safely
const getSchemaChanges = () => {
    return store.diffData?.diff?.schema_changes || { columns_added: [], columns_removed: [], columns_changed: [] };
};

// Check if a column was added
const isColumnAdded = (columnName) => {
    const { columns_added } = getSchemaChanges();
    return columns_added?.includes(columnName) || false;
};

// Check if a column was removed
const isColumnRemoved = (columnName) => {
    const { columns_removed } = getSchemaChanges();
    return columns_removed?.includes(columnName) || false;
};

// Check if a column has been renamed
const isColumnRenamed = (columnName) => {
    const { columns_changed } = getSchemaChanges();
    // Only consider old column names as renamed for display purposes
    return columns_changed?.some((change) => change.old === columnName) || false;
};

// Get the new name for a renamed column
const getNewColumnName = (columnName) => {
    const { columns_changed } = getSchemaChanges();
    const change = columns_changed?.find((change) => change.old === columnName);
    return change ? change.new : columnName;
};

// Helper function for column headers to determine if added, removed, or renamed
const isColumnAddedOrRemoved = (columnName) => {
    // Check for added/removed columns
    if (isColumnAdded(columnName)) return 'column-added-header';
    if (isColumnRemoved(columnName)) return 'column-removed-header';
    if (isColumnRenamed(columnName)) return 'column-renamed-header';

    return '';
};

// Check if a row was removed
const isRowRemoved = (row) => {
    // Check if we already marked it as removed during initialization
    if (row._removed) return true;

    if (!store.diffData?.diff?.data_changes?.rows_removed) return false;

    // Only rows from dataset_1 can be "removed"
    if (row._dataset !== 'dataset_1') return false;

    const removedRows = store.diffData.diff.data_changes.rows_removed;

    // Try direct match first if row has an entry_id
    if (row._entry_id) {
        // Check if any removed row has a matching entry_id
        const hasDirectMatch = removedRows.some(
            (removedRow) =>
                (removedRow._entry_id && removedRow._entry_id === row._entry_id) ||
                (removedRow.entry_id && removedRow.entry_id === row._entry_id),
        );

        if (hasDirectMatch) return true;
    }

    // Fall back to deeper comparison for all cases
    return removedRows.some((removedRow) => isRowMatchingRemoved(row, removedRow));
};

// Check if a row was changed
// TODO: isRowChanged is probably not correct. not values_modifed, but rows changed
const _isRowChanged = (row) => {
    if (!store.diffData || !store.diffData.diff || !store.diffData.diff.data_changes?.values_modified) return false;

    // For changed rows, must ensure it's not identified as added or removed
    if (row._added || row._removed || isRowRemoved(row)) {
        return false;
    }

    // For changed rows, match by entry_id against the 'key' property in changed rows
    if (row._entry_id && store.diffData.diff.changed.length > 0) {
        const isChanged = store.diffData.diff.changed.some((changedRow) => {
            return changedRow.key == row._entry_id; // Using == to handle string vs number comparison
        });

        return isChanged;
    }

    return false;
};

// Get row identifier for comparison
const getRowId = (row) => {
    return row._entry_id || row.entry_id;
};

// Check if a specific field in a row was modified
const isSpecificFieldChanged = (row, columnName) => {
    const rowId = getRowId(row);
    if (!rowId) return false;

    // Check in values_modified format
    const valuesModified = store.diffData?.diff?.data_changes?.values_modified;
    if (valuesModified?.length) {
        return valuesModified.some(
            (mod) =>
                String(mod.row) === String(rowId) && (mod.old_column === columnName || mod.new_column === columnName),
        );
    }

    // Fallback to changed format
    const changedRows = store.diffData?.diff?.data_changes?.changed;
    if (changedRows?.length) {
        const changedEntry = changedRows.find((change) => String(change.key) === String(rowId));
        return !!changedEntry?.changes?.[columnName];
    }

    return false;
};

// Helper to format values, showing placeholders for empty values
const formatValue = (value) => {
    return value === '' || value === null || value === undefined ? '(empty)' : value;
};

// Function to get the old and new values for a changed cell
const getChangedCellValues = (row, columnName) => {
    // First check in values_modified format
    if (store.diffData?.diff?.data_changes?.values_modified) {
        const modifiedValue = store.diffData.diff.data_changes.values_modified.find(
            (mod) =>
                (String(mod.row) === String(row._entry_id) || String(mod.row) === String(row.entry_id)) &&
                (mod.old_column === columnName || mod.new_column === columnName),
        );

        if (modifiedValue) {
            return [formatValue(modifiedValue.old_value), formatValue(modifiedValue.new_value)];
        }
    }

    // Fallback to changed format
    if (store.diffData?.diff?.changed) {
        const changedEntry = store.diffData.diff.changed.find(
            (change) => String(change.key) === String(row._entry_id) || String(change.key) === String(row.entry_id),
        );

        if (changedEntry?.changes?.[columnName]) {
            const [oldValue, newValue] = changedEntry.changes[columnName];
            return [formatValue(oldValue), formatValue(newValue)];
        }
    }

    return ['(unknown)', '(unknown)'];
};

// Additional helper to get value for a removed column in a row
// Helper function to get value for added rows
const getAddedRowValue = (row, column) => {
    // For added rows, the values are already in the correct format in the row object
    return row[column] !== undefined ? row[column] : '';
};

const getValueForRemovedColumn = (row, columnName) => {
    if (
        !store.diffData ||
        !store.diffData.diff ||
        !store.diffData.diff.data_changes?.rows_removed ||
        !isColumnRemoved(columnName)
    ) {
        return null;
    }

    // If the row already has a value for this column, return it
    if (row[columnName] !== undefined && row[columnName] !== null) {
        return row[columnName];
    }

    // Try to find a matching removed row in rows_removed
    if (row._entry_id) {
        const removedRow = store.diffData.diff.data_changes?.rows_removed.find(
            (r) => (r._entry_id && r._entry_id === row._entry_id) || (r.entry_id && r.entry_id === row._entry_id),
        );

        if (removedRow && columnName in removedRow) {
            return removedRow[columnName];
        }
    }

    return '';
};

// Function to trigger comparison
const compareVersions = async () => {
    if (store.selectedDiff.length !== 2) return;

    try {
        // Use the correct function name from the store
        if (typeof store.fetchDatasetDiff === 'function') {
            await store.fetchDatasetDiff();
        } else {
            return;
        }
    } catch (error) {
        // Error will be handled by the store
    }
};

// Automatically trigger comparison when two nodes are selected
watch(
    () => store.selectedDiff,
    (newVal) => {
        if (newVal.length === 2) {
            isComparing.value = true;
            compareVersions();
        } else {
            // Reset comparison state if selection changes
            isComparing.value = false;
        }
    },
    { deep: true },
);

// Also trigger comparison when component is mounted if two nodes are already selected
onMounted(() => {
    if (store.selectedDiff.length === 2) {
        isComparing.value = true;
        // Only fetch if we don't already have the data
        if (!store.diffData) {
            compareVersions();
        }
    }
});

// Computed property to determine if data is ready for display
const ready = computed(() => {
    return isComparing.value && store.diffData && !store.isLoadingDiff && !store.diffError;
});

// Helper function to create a row object from an array based on column mappings
const _createRowObjectFromArray = (rowArray, columnMappings, entryId = null) => {
    const rowObj = {};

    // Map array values to column names
    if (columnMappings.length > 0) {
        // If we have column mappings, use them
        columnMappings.forEach((colName, idx) => {
            if (idx < rowArray.length) {
                rowObj[colName] = rowArray[idx];
            }
        });
    } else {
        // Fallback: if no column mappings, use index-based keys
        rowArray.forEach((value, idx) => {
            rowObj[`column_${idx}`] = value;
        });
    }

    if (entryId !== null) {
        rowObj._entry_id = entryId;
    }

    return rowObj;
};

// Helper function to get column type
const _getColumnType = (columnName, datasetKey) => {
    if (!store.diffData) return null;

    const dataset =
        datasetKey === 'dataset_1'
            ? store.diffData.dataset_1 && store.diffData.dataset_1[0]
            : store.diffData.dataset_2 && store.diffData.dataset_2[0];

    if (!dataset || !dataset.data_model || !dataset.data_model.columns) return null;

    const columns = dataset.data_model.columns || [];

    // Handle different column formats
    if (columns.length > 0) {
        if (Array.isArray(columns[0])) {
            // Format: [["column_name", "column_type"], ...]
            const column = columns.find((c) => c[0] === columnName);
            if (column) {
                return column[1];
            }
        } else if (typeof columns[0] === 'object') {
            // Format: [{name: "column_name", dataType: "column_type"}, ...]
            const column = columns.find((c) => c.name === columnName);
            if (column) {
                return column.dataType || column.type;
            }
        }
    }

    return null;
};
</script>

<style scoped>
.compare-container {
    width: 100%;
    padding: 0;
}

/* Custom spinner color to match theme */
.spinner-pistis {
    color: #5632d0;
}

.compare-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
}

.instructions-panel {
    max-width: 800px;
    margin: 0 auto 20px;
}

/* Instructions card styling - matching Dataset Lineage page design */
.instructions-card {
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
}

.instructions-card h4 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.instructions-card h4::before {
    content: 'ℹ️';
    font-size: 20px;
}

.instructions-card p {
    font-size: 14px;
    color: #666;
    margin: 0 0 16px 0;
    line-height: 1.6;
}

.instructions-card ol {
    font-size: 14px;
    color: #555;
    margin: 0 0 20px 0;
    padding-left: 20px;
    line-height: 1.7;
}

.instructions-card ol li {
    margin-bottom: 10px;
    padding-left: 8px;
}

.instructions-card ol li::marker {
    color: #5632d0;
    font-weight: 600;
}

.selection-status {
    font-size: 14px;
    color: #333;
    padding: 14px 16px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #dee2e6;
    display: flex;
    align-items: center;
    gap: 8px;
}

.selection-status::before {
    content: '✓';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #5632d0;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
}

.selection-status strong {
    color: #5632d0;
    font-weight: 600;
    font-size: 15px;
}

.reset-button {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(108, 117, 125, 0.2);
}

.reset-button:hover {
    background: #5a6268;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

.comparison-panel {
    width: 100%;
    margin-top: 20px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

/* Success card styling - matching Dataset Lineage page design */
.success-card {
    background: #ffffff;
    border: 1px solid #c3e6cb;
    border-left: 4px solid #28a745;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
}

.success-card h4 {
    font-size: 20px;
    font-weight: 600;
    color: #155724;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.success-card h4::before {
    content: '✓';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: #28a745;
    color: white;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 600;
}

.success-card p {
    font-size: 14px;
    color: #155724;
    margin: 0 0 20px 0;
    line-height: 1.6;
}

.button-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.compare-button {
    background: #5632d0;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(86, 50, 208, 0.2);
}

.compare-button:hover {
    background: #4527b0;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(86, 50, 208, 0.3);
}

/* Error card styling - matching Dataset Lineage page design */
.error-card {
    background: #ffffff;
    border: 1px solid #f5c6cb;
    border-left: 4px solid #dc3545;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
}

.error-card h4 {
    font-size: 20px;
    font-weight: 600;
    color: #721c24;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.error-card h4::before {
    content: '⚠️';
    font-size: 22px;
}

.error-card p {
    font-size: 14px;
    color: #721c24;
    margin: 0 0 20px 0;
    line-height: 1.6;
}

.error-card .retry-button {
    background: #dc3545;
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
}

.error-card .retry-button:hover {
    background: #c82333;
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
}

.btn-primary {
    background: #5632d0;
    border-color: #4320b0;
}

.btn-primary:hover {
    background: #4320b0;
}

/* Integrated comparison styling */
.integrated-comparison-section {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
}

.comparison-summary {
    padding-bottom: 12px;
    position: relative;
}

.comparison-summary .d-flex {
    padding: 4px 0 0 0;
    justify-content: flex-start;
    flex-wrap: nowrap !important;
    overflow-x: auto;
    display: flex;
    flex-direction: row;
}

.summary-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    border-radius: 8px;
    min-width: 100px;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
    white-space: nowrap;
    transition: all 0.2s ease;
}

.summary-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.summary-item.added,
.summary-item.removed,
.summary-item.changed,
.summary-item.columns-added,
.summary-item.columns-removed {
    background-color: #f8f9fa;
    border-color: #e9ecef;
}

/* Badge styling - improved with better padding, keeping original colors */
.badge.bg-success {
    background-color: rgba(50, 220, 103, 0.85) !important;
    color: #000000 !important;
    padding: 4px 10px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    border-radius: 5px !important;
    box-shadow: 0 1px 3px rgba(50, 220, 103, 0.3);
    letter-spacing: 0.3px;
}

.badge.bg-danger {
    background-color: rgba(255, 87, 74, 0.85) !important;
    color: #000000 !important;
    padding: 4px 10px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    border-radius: 5px !important;
    box-shadow: 0 1px 3px rgba(255, 87, 74, 0.3);
    letter-spacing: 0.3px;
}

.badge.bg-info {
    background-color: rgba(33, 182, 204, 0.85) !important;
    color: #000000 !important;
    padding: 4px 10px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    border-radius: 5px !important;
    box-shadow: 0 1px 3px rgba(33, 182, 204, 0.3);
    letter-spacing: 0.3px;
}

.summary-item .count {
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 6px;
    color: #333;
}

.table-responsive {
    overflow-x: auto;
}

.comparison-container {
    overflow-x: auto;
    max-width: 100%;
    margin-top: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
    border-radius: 6px;
}

.comparison-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: none;
    margin: 0;
    font-size: 0.95rem;
}

.comparison-table th,
.comparison-table td {
    padding: 10px 14px;
    border: none;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
    vertical-align: middle;
    border-right: 1px solid #e0e0e0;
}

.comparison-table th:last-child,
.comparison-table td:last-child {
    border-right: none;
}

.comparison-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
    position: sticky;
    top: 0;
    z-index: 1;
    border-bottom: 2px solid #ddd;
    white-space: nowrap;
}

.comparison-table tbody tr:last-child td {
    border-bottom: none;
}

.comparison-table tbody tr:hover td:not(.cell-changed) {
    background-color: rgba(0, 0, 0, 0.02);
}

/* Cell styling for changed fields */
.comparison-table tbody td.cell-changed {
    background-color: rgba(33, 182, 204, 0.4) !important;
    font-weight: 600;
}

.comparison-table tbody td.cell-changed + td.cell-changed {
    border-left: none;
}

/* Cell styling for added column values */
.comparison-table tbody td.cell-added-value {
    background-color: rgba(50, 220, 103, 0.4) !important;
    font-weight: 600;
}

/* Row styling for added/removed rows */
.comparison-table tbody tr.row-added td {
    background-color: rgba(50, 220, 103, 0.3) !important;
    font-weight: 600;
}

.comparison-table tbody tr.row-added:hover td {
    background-color: rgba(50, 220, 103, 0.4) !important;
}

.comparison-table tbody tr.row-added td + td {
    border-left: none;
}

.comparison-table tbody tr.row-removed td {
    background-color: rgba(255, 87, 74, 0.3) !important;
    font-weight: 600;
}

.comparison-table tbody tr.row-removed:hover td {
    background-color: rgba(255, 87, 74, 0.4) !important;
}

.comparison-table tbody tr.row-removed td + td {
    border-left: none;
}

/* Column status styling */
td.column-added {
    background-color: rgba(50, 220, 103, 0.4) !important;
}

/* Move this after row-added to increase specificity and ensure it overrides */
.comparison-table tbody tr td.column-removed,
td.column-removed {
    background-color: rgba(255, 87, 74, 0.4) !important;
    font-weight: 600;
}

/* Empty cell in removed column */
.comparison-table tbody tr td.column-removed:empty,
.comparison-table tbody tr td.column-removed:blank,
.comparison-table tbody tr td.column-removed:has-text('') {
    background-color: rgba(244, 67, 54, 0.2) !important;
}

/* Column header styling */
.column-added-header {
    background-color: rgba(50, 220, 103, 0.4) !important;
    position: relative;
}

.added-column {
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
}

.added-column .added-name {
    font-weight: 600;
}

.column-removed-header {
    background-color: rgba(255, 87, 74, 0.4) !important;
    position: relative;
}

/* Column renamed styling */
.column-renamed-header {
    background-color: rgba(33, 182, 204, 0.4) !important;
    position: relative;
}

.renamed-column {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    white-space: nowrap;
}

.renamed-column .old-name {
    text-decoration: line-through;
    color: #d32f2f;
    opacity: 0.75;
}

.renamed-column .arrow {
    font-size: 0.9em;
    opacity: 0.7;
}

.renamed-column .new-name {
    font-weight: 600;
}

/* Styling for the changed values display */
.changed-value {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
}

.old-value {
    text-decoration: line-through;
    color: #d32f2f;
    opacity: 0.75;
    font-size: 0.9em;
    font-weight: 600;
}

.arrow {
    color: #666;
    font-weight: bold;
    font-size: 0.9em;
}

.new-value {
    color: #000000;
    font-weight: 600;
}

.data-comparison {
    padding-top: 0;
}

.schema-changes {
    padding: 0 16px 4px 16px;
}

.schema-changes h6 {
    margin: 16px 0;
    font-weight: 600;
}

/* Empty cell styling for added columns with no value */
.empty-cell {
    background-color: rgba(0, 200, 83, 0.1) !important;
}

/* Loading indicators - matching LineageView styling */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #5632d0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 16px;
    color: #666;
    margin: 0;
    text-align: center;
}

/* Pagination styles - Simple design */
.pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0 0 0;
    margin-bottom: 0;
}

.pagination-info {
    color: #666;
    font-size: 14px;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 20px;
}

.rows-per-page {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.rows-per-page label {
    margin: 0;
    color: #666;
}

.rows-per-page select {
    width: auto;
    min-width: 70px;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.page-navigation {
    display: flex;
    align-items: center;
    gap: 12px;
}

.page-info {
    font-size: 14px;
    color: #666;
    white-space: nowrap;
}

.page-navigation button {
    padding: 6px 12px;
    border: 1px solid #ddd;
    background: white;
    color: #333;
    border-radius: 4px;
    cursor: pointer;
}

.page-navigation button:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #5632d0;
    color: #5632d0;
}

.page-navigation button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: #999;
}

/* Responsive pagination */
@media (max-width: 768px) {
    .pagination-container {
        flex-direction: column;
        gap: 12px;
        align-items: center;
    }

    .pagination-controls {
        gap: 15px;
    }

    .page-navigation {
        gap: 8px;
    }
}
</style>
