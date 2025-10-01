<template>
    <div class="table-wrapper">
        <!-- Global Search Input -->
        <input v-model="searchQuery" type="text" class="global-search" placeholder="Search lineage table..." />

        <div class="table-scroll-container">
            <table class="table">
                <thead>
                    <tr>
                        <th
                            v-for="(header, index) in props.headers"
                            :key="index"
                            class="table_head sortable"
                            scope="col"
                            :class="getColumnClass(header.key)"
                            @click="sortTable(header.key)"
                        >
                            <div class="header-content">
                                <span class="header-label"
                                    ><strong>{{ header.label }}</strong></span
                                >
                                <span v-if="sortKey === header.key" class="sort-icon">
                                    {{ sortOrder === 'asc' ? '▲' : '▼' }}
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Show "No records found" when search returns empty results -->
                    <tr v-if="filteredTableData.length === 0">
                        <td :colspan="props.headers.length" class="no-results">No records match your search</td>
                    </tr>

                    <!-- Render Table Rows -->
                    <tr
                        v-for="(row, rowIndex) in filteredTableData"
                        :key="rowIndex"
                        :class="{
                            highlighted: String(row.id) === String(hoveredRow) && !props.useRedHighlight,
                            'highlighted-parent':
                                hoveredParents.map(String).includes(String(row.id)) && !props.useRedHighlight,
                            'highlighted-red':
                                (String(row.id) === String(hoveredRow) && props.useRedHighlight) ||
                                props.selectedDiff.map(String).includes(String(row.id)),
                        }"
                    >
                        <td class="text-center align-middle version-column">{{ row.version }}</td>
                        <td
                            class="align-middle id-column copyable-cell"
                            :class="{ copied: lastCopied === `${rowIndex}-id` }"
                            @click="copyToClipboard(row.id, rowIndex, 'id')"
                            @mouseleave="clearHoverSuppression"
                        >
                            <span class="cell-text">{{ row.id }}</span>
                            <span v-if="suppressHoverHint !== `${rowIndex}-id`" class="copy-hint">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Click to copy
                            </span>
                            <span v-if="lastCopied === `${rowIndex}-id`" class="copy-success-hint">Copied!</span>
                        </td>
                        <td
                            class="align-middle operation-column copyable-cell"
                            :title="formatActivityTooltip(row) + '\nClick to copy'"
                            :class="{ copied: lastCopied === `${rowIndex}-activity` }"
                            @click="copyToClipboard(formatActivityForCopy(row), rowIndex, 'activity')"
                        >
                            <div class="copy-content">
                                <div class="activity-with-details">
                                    <span class="cell-text activity-type">{{ row.activity }}</span>
                                    <!-- Activity Description -->
                                    <div v-if="row.activity_description" class="create-description">
                                        {{ row.activity_description }}
                                    </div>
                                    <div
                                        v-if="
                                            row.operation_description &&
                                            !hasNoOperationChanges(row.operation_description)
                                        "
                                        class="update-details"
                                    >
                                        <!-- Data Enrichment -->
                                        <div v-if="row.operation_description.data_enrichment" class="detail-item">
                                            <div class="detail-header">
                                                <span class="detail-intro">
                                                    <strong>Data Enrichment:</strong>
                                                    {{
                                                        parseDataEnrichment(row.operation_description.data_enrichment)
                                                            .intro
                                                    }}
                                                </span>
                                            </div>
                                            <ul class="section-items-list">
                                                <li
                                                    v-for="(change, index) in parseDataEnrichment(
                                                        row.operation_description.data_enrichment,
                                                    ).changes"
                                                    :key="'enrich-' + index"
                                                    class="section-item"
                                                >
                                                    <span class="item-enrichment">
                                                        {{ change.oldName }} → {{ change.newName }}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>

                                        <!-- Data Transformations -->
                                        <div v-if="row.operation_description.data_transformations" class="detail-item">
                                            <div class="detail-header">
                                                <span class="detail-intro">
                                                    <strong>Data Transformations:</strong>
                                                    {{
                                                        parseDataTransformations(
                                                            row.operation_description.data_transformations,
                                                        ).intro
                                                    }}
                                                </span>
                                            </div>
                                            <ul class="section-items-list">
                                                <li
                                                    v-for="(change, index) in parseDataTransformations(
                                                        row.operation_description.data_transformations,
                                                    ).changes"
                                                    :key="'transform-' + index"
                                                    class="section-item"
                                                >
                                                    <span class="item-transformation">
                                                        {{ change.description }}: {{ change.details }}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>

                                        <!-- Schema Changes -->
                                        <div
                                            v-if="
                                                row.operation_description.schema_changes &&
                                                !row.operation_description.data_enrichment
                                            "
                                            class="detail-item"
                                        >
                                            <div class="detail-header">
                                                <span class="detail-intro">
                                                    <strong>Schema Changes:</strong>
                                                    {{
                                                        parseSchemaChanges(row.operation_description.schema_changes)
                                                            .intro
                                                    }}
                                                </span>
                                            </div>
                                            <ul class="section-items-list">
                                                <li
                                                    v-for="(change, index) in parseSchemaChanges(
                                                        row.operation_description.schema_changes,
                                                    ).changes"
                                                    :key="'schema-' + index"
                                                    class="section-item"
                                                    :class="change.type"
                                                >
                                                    <template v-if="change.type === 'renamed'">
                                                        <span class="item-renamed"
                                                            >{{ change.oldName }} → {{ change.newName }}</span
                                                        >
                                                    </template>
                                                    <template v-else>
                                                        <span :class="'item-' + change.type">{{ change.text }}</span>
                                                    </template>
                                                </li>
                                            </ul>
                                        </div>

                                        <!-- Data Changes -->
                                        <div v-if="row.operation_description.data_changes" class="detail-item">
                                            <div class="detail-header">
                                                <span class="detail-intro">
                                                    <strong>Data Changes:</strong>
                                                    {{ parseDataChanges(row.operation_description.data_changes).intro }}
                                                </span>
                                            </div>
                                            <ul class="section-items-list">
                                                <li
                                                    v-for="(change, index) in parseDataChanges(
                                                        row.operation_description.data_changes,
                                                    ).changes"
                                                    :key="'data-' + index"
                                                    class="section-item"
                                                >
                                                    <span :class="'item-' + change.type">
                                                        {{ change.count }} value(s) {{ change.type }} in column '{{
                                                            change.column
                                                        }}'
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <!-- No changes message for Update activity with no actual changes -->
                                    <div
                                        v-if="
                                            row.activity.toUpperCase() === 'UPDATE' &&
                                            hasNoOperationChanges(row.operation_description)
                                        "
                                        class="no-changes-message"
                                    >
                                        No schema changes, data changes, data transformations, or data enrichments
                                        detected.
                                    </div>
                                </div>
                            </div>
                            <span v-if="lastCopied === `${rowIndex}-activity`" class="copy-indicator">Copied!</span>
                        </td>
                        <td
                            class="align-middle username-column copyable-cell"
                            :class="{ copied: lastCopied === `${rowIndex}-username` }"
                            @click="copyToClipboard(row.username, rowIndex, 'username')"
                            @mouseleave="clearHoverSuppression"
                        >
                            <span class="cell-text">{{ row.username }}</span>
                            <span v-if="suppressHoverHint !== `${rowIndex}-username`" class="copy-hint">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Click to copy
                            </span>
                            <span v-if="lastCopied === `${rowIndex}-username`" class="copy-success-hint">Copied!</span>
                        </td>
                        <td
                            class="align-middle timestamp-column copyable-cell"
                            :title="row.timestamp + '\nClick to copy'"
                            :class="{ 'timestamp-copied': lastCopied === `${rowIndex}-timestamp` }"
                            @click="copyToClipboard(row.timestamp, rowIndex, 'timestamp')"
                        >
                            <div class="copy-content">
                                <span class="cell-text">{{ row.timestamp }}</span>
                            </div>
                            <span
                                v-if="lastCopied === `${rowIndex}-timestamp`"
                                class="copy-indicator timestamp-indicator"
                                >Copied!</span
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

// Accept hoveredRow with a default value
const props = defineProps({
    headers: Array,
    tableData: {
        type: Array,
        default: () => [],
    },
    hoveredRow: {
        type: [String, Number],
        default: null,
    },
    hoveredParents: {
        type: Array,
        default: () => [],
    },
    useRedHighlight: {
        type: Boolean,
        default: false,
    },
    selectedDiff: {
        type: Array,
        default: () => [],
    },
});

// Track which cell was last copied
const lastCopied = ref(null);

// Track which cell should suppress hover hint (after copy, until mouse leaves)
const suppressHoverHint = ref(null);

// Helper function to check if operation description has no actual changes
const hasNoOperationChanges = (operationDescription) => {
    if (!operationDescription) return true;

    return (
        !operationDescription.data_changes &&
        !operationDescription.data_enrichment &&
        !operationDescription.data_transformations &&
        !operationDescription.schema_changes
    );
};

// Format activity for copy to clipboard
const formatActivityForCopy = (row) => {
    if (row.activity_description) {
        return `${row.activity}\n${row.activity_description}`;
    }
    if (row.activity !== 'DATASET UPDATED') {
        return row.activity;
    }

    if (hasNoOperationChanges(row.operation_description)) {
        return 'DATASET UPDATED\nNo schema changes, data changes, data transformations, or data enrichments detected.';
    }

    let result = 'DATASET UPDATED';

    if (row.operation_description.schema_changes) {
        result += `\nSchema Changes: ${row.operation_description.schema_changes}`;
    }

    if (row.operation_description.data_changes) {
        result += `\nData Changes: ${row.operation_description.data_changes}`;
    }

    if (row.operation_description.data_transformations) {
        result += `\nData Transformations: ${row.operation_description.data_transformations}`;
    }

    if (row.operation_description.data_enrichment) {
        result += `\nData Enrichment: ${row.operation_description.data_enrichment}`;
    }

    return result;
};

// Format tooltip text for activity cell
const formatActivityTooltip = (row) => {
    return formatActivityForCopy(row);
};

// Function to copy text to clipboard with visual feedback
const copyToClipboard = (text, rowIndex, columnType) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            // Set the last copied cell identifier
            const cellId = `${rowIndex}-${columnType}`;
            lastCopied.value = cellId;
            // Suppress hover hint for this cell until mouse leaves
            suppressHoverHint.value = cellId;

            // Provide haptic feedback if available (mobile devices)
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50); // Short vibration for tactile feedback
            }
            // Clear the indicator after a short delay
            setTimeout(() => {
                lastCopied.value = null;
            }, 1500); // Extended from 1000ms to 1500ms for better visibility
        })
        .catch((err) => {
            console.error('Error copying text: ', err);
        });
};

// Function to clear hover hint suppression when mouse leaves cell
const clearHoverSuppression = () => {
    suppressHoverHint.value = null;
};

// Function to determine column classes based on column key
const getColumnClass = (key) => {
    return {
        'version-column': key === 'version',
        'id-column': key === 'id',
        'operation-column': key === 'activity',
        'username-column': key === 'username',
        'timestamp-column': key === 'timestamp',
        'operation-description-column': key === 'operation_description',
    };
};

// Watch hoveredRow and log updates from the parent
watch(
    () => props.hoveredRow,
    (_newValue) => {},
);

const sortKey = ref('version');
const sortOrder = ref('desc');
const searchQuery = ref('');

// Sorting Function
const sortTable = (key) => {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
    }
};

// Computed: Filtered & Sorted Table Data
const filteredTableData = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();

    if (!query) return sortedTableData.value;

    return sortedTableData.value.filter((row) => {
        return props.headers.some((header) => {
            const value = row[header.key];
            if (value === null || value === undefined) return false;

            // Special handling for activity column to also search activity_description and operation_description
            if (header.key === 'activity') {
                // Search in activity_description
                if (row.activity_description && row.activity_description.toLowerCase().includes(query)) {
                    return true;
                }

                // Search in operation_description
                if (row.activity === 'DATASET UPDATED' && row.operation_description) {
                    const opDesc = row.operation_description;
                    if (
                        (opDesc.schema_changes && String(opDesc.schema_changes).toLowerCase().includes(query)) ||
                        (opDesc.data_changes && String(opDesc.data_changes).toLowerCase().includes(query)) ||
                        (opDesc.data_transformations &&
                            String(opDesc.data_transformations).toLowerCase().includes(query)) ||
                        (opDesc.data_enrichment && String(opDesc.data_enrichment).toLowerCase().includes(query))
                    ) {
                        return true;
                    }
                }
            }

            return String(value).toLowerCase().includes(query);
        });
    });
});

// Computed: Sorted Table Data
const sortedTableData = computed(() => {
    return [...props.tableData].sort((a, b) => {
        const valueA = a[sortKey.value] ?? '';
        const valueB = b[sortKey.value] ?? '';

        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortOrder.value === 'asc'
                ? valueA.localeCompare(valueB, undefined, { numeric: true })
                : valueB.localeCompare(valueA, undefined, { numeric: true });
        } else {
            return sortOrder.value === 'asc' ? valueA - valueB : valueB - valueA;
        }
    });
});

// Ensure the table is sorted on mount
onMounted(() => {
    sortTable('version');
});

// Function to highlight added and removed items
const _highlightAddedRemovedItems = (text) => {
    if (!text || typeof text !== 'string') return text;

    // Define patterns for addition and removal
    const columnAddedPattern = /(\d+)\s+columns?\s+added\s*\(([^)]+)\)/gi;
    const columnRemovedPattern = /(\d+)\s+columns?\s+removed\s*\(([^)]+)\)/gi;
    const recordAddedPattern = /(\d+)\s+records?\s+added/gi;
    const recordRemovedPattern = /(\d+)\s+records?\s+removed/gi;
    const recordModifiedPattern = /(\d+)\s+records?\s+modified/gi;
    const removedRecordsPattern = /Removed\s+(\d+)\s+records?\s+with\s+missing\s+values/gi;
    const missingValuesPattern = /Missing\s+values\s+replaced\s+with.*?(\([^)]+\))/gi;

    // Replace patterns with highlighted versions
    let result = text
        // Handle column additions
        .replace(columnAddedPattern, '<span class="item-added">$&</span>')
        // Handle column removals
        .replace(columnRemovedPattern, '<span class="item-removed">$&</span>')
        // Handle record additions
        .replace(recordAddedPattern, '<span class="item-added">$&</span>')
        // Handle record removals
        .replace(recordRemovedPattern, '<span class="item-removed">$&</span>')
        // Handle removed records with missing values
        .replace(removedRecordsPattern, '<span class="item-removed">$&</span>')
        // Handle record modifications (normal styling)
        .replace(recordModifiedPattern, '<span>$&</span>')
        // Handle missing values replacement (highlight the columns in parentheses)
        .replace(missingValuesPattern, function (match, columns) {
            return match.replace(columns, '<span class="item-added">' + columns + '</span>');
        });

    return result;
};

// Check if the row has no changes
const _isNoChanges = (row) => {
    // Check if operation description contains the "no changes" message
    if (typeof row.activity === 'string' && row.activity.includes('No changes detected in the dataset')) {
        return true;
    }

    // Check if JSON is empty or all sections are empty
    if (row.operation_description) {
        const sections = ['schema_changes', 'data_changes', 'data_transformations'];
        const allEmpty = sections.every(
            (section) =>
                !row.operation_description[section] ||
                row.operation_description[section] === 'None' ||
                String(row.operation_description[section]).trim() === '',
        );
        return allEmpty && !hasDataEnrichment(row);
    }

    return false;
};

// Check if a specific section has content
const _hasSection = (row, sectionName) => {
    if (!row || !row.operation_description) return false;

    // Get the content for this section
    const content = row.operation_description[sectionName];

    // Check if content exists and is not empty
    return content !== null && content !== undefined && String(content).trim() !== '' && content !== 'None';
};

// Check if the row has data enrichment information
const hasDataEnrichment = (row) => {
    // Check for operation_description JSON format
    if (row.operation_description && typeof row.operation_description === 'object') {
        return (
            row.operation_description.data_enrichment !== null &&
            row.operation_description.data_enrichment !== undefined
        );
    }

    // Legacy format check (string)
    if (typeof row.activity === 'string') {
        return row.activity.includes('Data Enrichment:') || row.activity.includes('Format Change:');
    }

    return false;
};

// Extract data enrichment information
const _extractDataEnrichment = (row) => {
    // First try to get from JSON
    if (row.operation_description && row.operation_description.data_enrichment) {
        return row.operation_description.data_enrichment;
    }

    // Fallback to parsing from string
    if (typeof row.activity === 'string') {
        // Try to extract Data Enrichment section
        const enrichMatch = row.activity.match(/[-\s]*(Data\s*Enrichment)[:;]([^-]*?)(?=\n-|\n\n|$)/i);
        if (enrichMatch) {
            return enrichMatch[2].trim();
        }

        // Try to extract Format Change section
        const formatMatch = row.activity.match(/[-\s]*(Format\s*Change)[:;]([^-]*?)(?=\n-|\n\n|$)/i);
        if (formatMatch) {
            return formatMatch[2].trim();
        }
    }

    return 'None';
};

// Helper function to parse schema changes
const parseSchemaChanges = (schemaChanges) => {
    if (!schemaChanges) return { intro: '', changes: [] };

    const changes = [];
    let intro = '';

    // First, try to extract the intro sentence that describes the total changes
    const totalChangesMatch = schemaChanges.match(/^(.*?)(?=\.\s*(?:Added|Removed|Renamed))/);
    if (totalChangesMatch) {
        intro = totalChangesMatch[1].trim();
    }

    // Parse added columns
    const addedMatch = schemaChanges.match(/Added (\d+) column\(s\): (.*?)\./);
    if (addedMatch) {
        const addedColumns = addedMatch[2].split(', ').map((col) => col.trim());
        changes.push(...addedColumns.map((col) => ({ type: 'added', text: col })));
    }

    // Parse removed columns
    const removedMatch = schemaChanges.match(/Removed (\d+) column\(s\): (.*?)\./);
    if (removedMatch) {
        const removedColumns = removedMatch[2].split(', ').map((col) => col.trim());
        changes.push(...removedColumns.map((col) => ({ type: 'removed', text: col })));
    }

    // Parse renamed columns
    const renamedMatch = schemaChanges.match(/Renamed (\d+) column\(s\): (.*?)\./);
    if (renamedMatch) {
        const renamedPairs = renamedMatch[2].split(', ').map((pair) => {
            const [oldName, newName] = pair.split(' → ').map((name) => name.trim().replace(/['"]/g, ''));
            return { type: 'renamed', oldName, newName };
        });
        changes.push(...renamedPairs);
    }

    // If no intro was found but we have changes, create a summary intro
    if (!intro && changes.length > 0) {
        const addedCount = changes.filter((c) => c.type === 'added').length;
        const removedCount = changes.filter((c) => c.type === 'removed').length;
        const renamedCount = changes.filter((c) => c.type === 'renamed').length;

        const parts = [];
        if (addedCount > 0) parts.push(`Added ${addedCount} column${addedCount > 1 ? 's' : ''}`);
        if (removedCount > 0) parts.push(`Removed ${removedCount} column${removedCount > 1 ? 's' : ''}`);
        if (renamedCount > 0) parts.push(`Renamed ${renamedCount} column${renamedCount > 1 ? 's' : ''}`);

        intro = parts.join(', ') + '.';
    }

    return { intro, changes };
};

// Helper function to parse data changes
const parseDataChanges = (dataChanges) => {
    if (!dataChanges) return { intro: '', changes: [] };

    const changes = [];
    let intro = '';

    // Extract intro sentence
    const introMatch = dataChanges.match(/^(.*?)(?=- Column|$)/);
    if (introMatch) {
        intro = introMatch[1].trim();
    }

    const columnMatches = dataChanges.matchAll(/- Column '([^']+)': (\d+) value\(s\) (modified|added|removed)\./g);

    for (const match of columnMatches) {
        const [_, column, count, action] = match;
        changes.push({
            type: action,
            column,
            count: parseInt(count),
        });
    }

    return { intro, changes };
};

// Helper function to parse data transformations
const parseDataTransformations = (transformations) => {
    if (!transformations) return { intro: '', changes: [] };

    const changes = [];
    let intro = '';

    // Extract intro sentence - everything before the first dash
    const introMatch = transformations.match(/^(.*?)(?=\s*-\s+|$)/);
    if (introMatch) {
        intro = introMatch[1].trim();
    }

    // Split the transformations by looking for lines that start with a dash
    // This captures the entire transformation item even if it contains colons or commas
    const transformationItems = transformations.split(/\n\s*-\s+/).slice(1);

    // If no items were found using newlines, try splitting on dash with space directly
    if (transformationItems.length === 0 && transformations.includes('- ')) {
        const dashIndex = transformations.indexOf('- ');
        if (dashIndex > -1) {
            const item = transformations.substring(dashIndex + 2).trim();
            transformationItems.push(item);
        }
    }

    // Process each transformation item
    for (const item of transformationItems) {
        // Try to extract the description (before the colon) and details (after the colon)
        const colonIndex = item.indexOf(':');

        if (colonIndex > -1) {
            const description = item.substring(0, colonIndex).trim();
            // Get everything after the colon until the end or until a period at the end
            let details = item.substring(colonIndex + 1).trim();
            if (details.endsWith('.')) {
                details = details.substring(0, details.length - 1);
            }

            changes.push({
                type: 'transformation',
                description,
                details,
            });
        } else {
            // If no colon is found, use the whole item as the description
            changes.push({
                type: 'transformation',
                description: item,
                details: '',
            });
        }
    }

    return { intro, changes };
};

// Helper function to parse data enrichment
const parseDataEnrichment = (enrichment) => {
    if (!enrichment) return { intro: '', changes: [] };

    const changes = [];
    let intro = '';

    // Extract intro sentence
    const introMatch = enrichment.match(/^(.*?)(?='[^']+' → |$)/);
    if (introMatch) {
        intro = introMatch[1].trim();
    }

    const enrichmentMatches = enrichment.matchAll(/'([^']+)' → '([^']+)'/g);

    for (const match of enrichmentMatches) {
        const [_, oldName, newName] = match;
        changes.push({
            type: 'enrichment',
            oldName,
            newName,
        });
    }

    return { intro, changes };
};
</script>

<style scoped>
/* Table wrapper to contain everything */
.table-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Scroll container for the table */
.table-scroll-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: visible;
}

tbody tr td {
    background-color: #ffffff !important;
    border-left: 3px solid transparent;
    transition: all 0.15s ease-in-out;
}

tbody tr:hover {
    transform: scale(1.005);
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1) !important;
    cursor: pointer;
    z-index: 2 !important;
    position: relative;
}

tbody tr:hover td {
    position: relative;
    z-index: 1;
}

/* 🔍 Styled Search Input */
.global-search {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    font-size: 16px;
    border: 2px solid #ccc;
    border-radius: 8px;
    outline: none;
    transition: all 0.3s ease;
}

.global-search:focus {
    border-color: #5632d0;
    box-shadow: 0px 0px 8px rgba(86, 50, 208, 0.3);
}

/* 📌 Table Styling */
.table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
    table-layout: auto;
}

/* 📌 Table Header */
thead th {
    font-weight: 400;
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    background-color: #5632d0;
    color: #fff;
    text-transform: uppercase;
    cursor: pointer;
    padding: 12px 10px;
    text-align: left;
    transition: background 0.3s ease;
    white-space: nowrap;
    border-bottom: 2px solid #4528a0;
    letter-spacing: 0.3px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-shadow: none;
    font-size: 0.85em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Styling for header content container */
.header-content {
    display: flex;
    align-items: center;
    white-space: nowrap;
    font-size: 0.95em;
}

/* Styling for header label */
.header-label {
    margin-right: 3px;
    font-weight: 400;
    display: inline-block;
}

/* Styling for sort icon */
.sort-icon {
    display: inline-block;
    font-size: 0.9em;
    line-height: 1;
    vertical-align: middle;
    margin-left: 0px;
}

/* Column width specifications */
.version-column {
    width: 8%;
    min-width: 80px;
}

.id-column {
    width: 15%;
    min-width: 120px;
}

.operation-column {
    width: 35%;
    min-width: 250px;
}

.username-column {
    width: 15%;
    min-width: 100px;
}

.timestamp-column {
    width: 20%;
    min-width: 140px;
}

.operation-description {
    white-space: normal;
    text-align: left;
    word-break: normal;
    overflow-wrap: break-word;
    line-height: 1.4;
}

/* Enhanced styling for all table cells to match activity styling */
td {
    word-break: normal;
    overflow-wrap: break-word;
    padding: 10px 8px;
    border-bottom: 1px solid #eaeaea;
    transition: all 0.2s ease;
    font-size: 0.9em;
}

/* Special styling for version cell with increased specificity */
.table tbody tr td.version-column,
.table tbody tr:nth-child(even) td.version-column,
.table tbody tr:nth-child(odd) td.version-column,
.table tbody tr:hover td.version-column {
    font-weight: 600;
    color: #000000;
    text-align: center;
    font-size: 1.05em;
    border-left: 3px solid transparent;
    background-color: #ffffff;
    transition: all 0.2s ease;
}

tbody tr:hover td.version-column {
    background-color: #ffffff;
}

tbody tr.highlighted td.version-column {
    background-color: #ffe0b2 !important;
    transition: all 0.2s ease !important;
    border-left: 3px solid transparent !important;
}

tbody tr.highlighted-parent td.version-column {
    background-color: #fff3e0 !important; /* Match the highlighted parent row light orange background */
    transition: all 0.2s ease !important; /* Standardized transition timing */
    border-left: 3px solid transparent !important; /* Keep transparent border during transitions */
}

/* Special styling for ID cell */
td.id-column {
    font-weight: 500;
    color: #333;
    border-left: 3px solid transparent;
    transition: all 0.2s ease;
    position: relative;
}

td.id-column:hover {
    border-left: 3px solid transparent;
    background-color: #ffffff !important;
}

/* Special styling for username cell */
td.username-column {
    font-weight: 500;
    color: #333;
    border-left: 3px solid transparent;
    transition: all 0.2s ease;
    position: relative;
}

td.username-column:hover {
    border-left: 3px solid transparent;
    background-color: #ffffff !important;
}

/* Special styling for timestamp cell */
td.timestamp-column {
    font-weight: 500;
    color: #333;
    border-left: 3px solid transparent !important;
    transition: all 0.2s ease;
}

td.timestamp-column:hover {
    border-left: 3px solid transparent !important;
    background-color: transparent !important;
}

td.timestamp-column.copyable-cell:hover {
    background-color: transparent !important;
    border-left: 3px solid transparent !important;
}

td.timestamp-column.copyable-cell {
    cursor: default;
}

/* Override timestamp column when in copied state */
td.timestamp-column.copied,
td.timestamp-column.timestamp-copied {
    animation: none !important;
    background-color: transparent !important;
    border-left: 3px solid transparent !important;
}

/* Special style for timestamp copy indicator */
.timestamp-indicator {
    background-color: rgba(86, 50, 208, 0.9) !important;
    top: -40px !important;
    font-size: 12px !important;
}

/* Base styles for all table cells */
.table td {
    border-left: 3px solid transparent;
}

tbody tr.highlighted td {
    background-color: #ffe0b2 !important;
    transition: all 0.2s ease !important;
    border-left: 3px solid transparent !important;
}

tbody tr.highlighted-parent td {
    background-color: #fff3e0 !important;
    transition: all 0.2s ease !important;
    border-left: 3px solid transparent !important;
}

tbody tr.highlighted-red td {
    background-color: #ffe0b2 !important;
    color: #333 !important;
    transition: all 0.2s ease !important;
    border-left: 3px solid transparent !important;
}

.no-results {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
    background-color: rgba(240, 240, 250, 0.3);
    border-radius: 4px;
}

.copyable-cell {
    user-select: none;
    position: relative;
    transition: all 0.15s ease-in-out;
}

/* Only show pointer cursor for ID and username columns */
.id-column.copyable-cell,
.username-column.copyable-cell {
    cursor: pointer !important;
}

/* Use default cursor for non-copyable columns */
.version-column,
.operation-column.copyable-cell {
    cursor: default !important;
}

/* Override specific hover styles for ID, username and timestamp columns */
td.id-column:hover,
td.username-column:hover {
    border-left: 3px solid transparent;
    background-color: #ffffff !important;
}

td.timestamp-column:hover {
    border-left: 3px solid transparent !important;
    background-color: transparent !important;
}

/* Ensure highlighted rows take precedence over hover states */
tbody tr.highlighted td.copyable-cell:hover,
tbody tr.highlighted-parent td.copyable-cell:hover,
tbody tr.highlighted-red td.copyable-cell:hover {
    background-color: inherit !important;
    border-left: 3px solid transparent !important;
}

/* Copy content layout */
.copy-content {
    position: relative;
    width: 100%;
    height: 100%;
}

.cell-text {
    flex: 1;
    min-width: 0;
}

/* Copy hint tooltip that shows on hover */
.copy-hint {
    display: none;
    align-items: center;
    gap: 2px;
    padding: 2px 5px;
    background-color: #5632d0;
    color: white;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 1px 4px rgba(86, 50, 208, 0.3);
    pointer-events: none;
    position: absolute;
    top: 3px;
    right: 3px;
    animation: fadeInScale 0.15s ease-out;
    z-index: 5;
}

.copy-hint svg {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
}

/* Show copy hint on hover for ID and username columns */
.id-column:hover .copy-hint,
.username-column:hover .copy-hint {
    display: flex;
}

/* Hide copy hint when cell is in copied state or recently copied */
.copyable-cell.copied .copy-hint,
.id-column:has(.copy-success-hint) .copy-hint,
.username-column:has(.copy-success-hint) .copy-hint {
    display: none !important;
}

/* Copy success hint */
.copy-success-hint {
    display: flex !important;
    align-items: center;
    gap: 2px;
    padding: 2px 5px;
    background-color: #28a745;
    color: white;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 1px 4px rgba(40, 167, 69, 0.3);
    pointer-events: none;
    position: absolute;
    top: 3px;
    right: 3px;
    animation: successPulse 0.4s ease-out;
    z-index: 100;
}

/* Animation for the copy hint */
@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Success pulse animation */
@keyframes successPulse {
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1.1);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* Copy indicator tooltip */
.copy-indicator {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #5632d0;
    color: white;
    padding: 6px 14px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    animation: fadeInDown 0.3s ease-out;
    letter-spacing: 0.3px;
}

/* Add a small arrow/triangle to the tooltip */
.copy-indicator::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: #5632d0 transparent transparent transparent;
}

/* Enhanced animation for tooltip */
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translate(-50%, -10px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

.table th {
    overflow: visible;
}

.table td {
    overflow: visible;
}

.activity-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.activity-header {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    font-size: 1em;
    text-transform: uppercase;
    letter-spacing: normal;
}

.activity-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.activity-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    background-color: rgba(240, 240, 250, 0.5);
    padding: 6px 8px;
    border-radius: 4px;
    border-left: 3px solid #5632d0;
    margin-top: 3px;
}

.section-title {
    font-weight: 500;
    margin-bottom: 4px;
    color: #333;
}

/* Styling for the bullet point list */
.section-items-list {
    list-style-type: none;
    padding-left: 16px;
    margin: 0;
}

.section-item {
    padding: 2px 0;
    position: relative;
}

.section-item:has(.item-transformation)::before {
    content: '•';
    position: absolute;
    left: -12px;
    color: #9e9e9e;
    font-size: 14px;
}

.section-item:has(.item-added, .item-removed, .item-renamed, .item-enrichment, .item-modified)::before {
    content: none;
}

.item-added::before {
    content: '+';
    position: absolute;
    left: -12px;
    color: #333333;
    font-size: 16px;
}

.item-removed::before {
    content: '-';
    position: absolute;
    left: -12px;
    color: #333333;
    font-size: 16px;
}

.item-renamed::before,
.item-modified::before {
    content: '•';
    position: absolute;
    left: -12px;
    color: #333333;
    font-size: 14px;
}

.item-enrichment::before {
    content: '•';
    position: absolute;
    left: -12px;
    color: #333333;
    font-size: 14px;
}

.item-added {
    color: #333333;
    font-weight: 500;
    position: relative;
}

.item-removed {
    color: #333333;
    font-weight: 500;
    position: relative;
}

.item-renamed,
.item-modified {
    color: #333333;
    font-weight: 500;
    position: relative;
}

.item-transformation {
    color: #333333;
    font-weight: 500;
}

.item-enrichment {
    color: #333333;
    font-weight: 500;
    position: relative;
}

.section-item .item-added,
.section-item .item-removed,
.section-item .item-renamed,
.section-item .item-modified,
.section-item .item-enrichment {
    color: #333333;
}

.section-item .item-added {
    color: #333333;
}

.section-item .item-removed {
    color: #333333;
}

.section-item .item-renamed,
.section-item .item-modified {
    color: #333333;
}

.section-item .item-enrichment {
    color: #333333;
}

tbody tr.highlighted td.version-column {
    background-color: #ffe0b2 !important;
    transition: all 0.2s ease !important;
    border-left: 3px solid transparent !important;
}

tbody tr.highlighted-parent td.version-column {
    background-color: #fff3e0 !important;
    transition: all 0.2s ease !important;
    border-left: 3px solid transparent !important;
}

tbody tr.highlighted-red td.version-column {
    background-color: #ffe0b2 !important;
    color: #333 !important;
    transition: all 0.2s ease !important;
    border-left: 3px solid transparent !important;
}

/* Styling for "No changes" message */
.no-changes-message {
    font-size: 0.95em;
    line-height: 1.4;
    padding: 8px 10px;
    background-color: rgba(240, 240, 250, 0.6);
    border-radius: 4px;
    color: #555;
    font-style: italic;
    text-align: left;
    border-left: 3px solid #aaa;
    margin: 4px 0;
}

/* Styling for "Create" activity description */
.create-description {
    font-size: 0.95em;
    line-height: 1.4;
    padding: 8px 10px;
    background-color: rgba(86, 50, 208, 0.05);
    border-radius: 4px;
    color: #444;
    text-align: left;
    border-left: 3px solid #5632d0;
    margin: 4px 0;
}

/* Operation Description Column */
.operation-description-column {
    display: none;
}

.operation-details {
    white-space: normal;
    overflow: visible;
}

.detail-section {
    margin-bottom: 8px;
}

.detail-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
}

.detail-content {
    padding-left: 8px;
}

.activity-with-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.activity-type {
    font-weight: 500;
    color: #333333;
    font-size: 1.1em;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-family: inherit;
    margin-bottom: 0;
    display: inline-block;
}

.update-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
}

.detail-item {
    font-size: 0.95em;
    line-height: 1.4;
    padding: 12px 16px;
    border-left: 2px solid #5632d0;
    margin: 8px 0;
    background-color: rgba(86, 50, 208, 0.03);
    border-radius: 0 6px 6px 0;
}

.detail-label {
    font-weight: 600;
    color: #333333;
    display: block;
    margin-bottom: 4px;
    white-space: nowrap;
    padding-top: 2px;
}

.detail-intro {
    color: #444444;
    font-size: 0.95em;
    line-height: 1.5;
    margin-bottom: 12px;
    font-style: italic;
}

.detail-intro strong {
    color: #5632d0;
    font-weight: 600;
    font-size: 1.1em;
    margin-right: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-block;
    padding-bottom: 2px;
    border-bottom: 2px solid rgba(86, 50, 208, 0.2);
}

.operation-column {
    width: 46%;
    min-width: max(300px, fit-content);
    max-width: none;
}

/* Ensure operation-description column is removed from view */
.operation-description-column {
    display: none;
}

/* Ensure that when hovering over the activity cell, the details remain visible */
.copyable-cell:hover .update-details {
    visibility: visible;
    opacity: 1;
}

/* When a row is highlighted, ensure the details have proper contrast */
tbody tr.highlighted .detail-item,
tbody tr.highlighted-parent .detail-item,
tbody tr.highlighted-red .detail-item {
    background-color: rgba(255, 255, 255, 0.5);
}

td.operation-column {
    padding: 10px 12px;
}

/* Update detail label styling */
.detail-label {
    font-weight: 600;
    color: #333333;
    display: block;
    margin-bottom: 4px;
    white-space: nowrap;
    padding-top: 2px;
}
</style>
