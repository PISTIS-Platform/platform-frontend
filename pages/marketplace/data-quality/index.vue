<!-- filepath: src/App.vue -->
<template>
    <div class="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-2 md:mb-0">Data Quality Rules Configuration</h1>
        </header>
        <!-- Dataset Selector -->
        <section class="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div class="flex items-center gap-4">
                <label class="font-semibold text-gray-700 text-sm">Select Dataset:</label>
                <select v-model="selectedDataset" class="border rounded px-3 py-2 text-sm">
                    <option v-for="ds in datasets" :key="ds.id" :value="ds">
                        {{ getDatasetDisplayTitle(ds) }}
                    </option>
                </select>
            </div>
        </section>
        <!-- Zones -->
        <div class="flex flex-col md:flex-row gap-8 min-h-[500px]">
            <!-- Available Rules Zone -->
            <section class="flex-1 bg-white rounded-lg shadow p-6 border-2 border-indigo-700">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-800">Available Rules</h2>
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-600">Filter by Dimension:</label>
                        <select v-model="selectedDimension" class="border rounded px-2 py-1 text-sm">
                            <option value="all">All Dimensions</option>
                            <option v-for="dim in dimensions" :key="dim" :value="dim">{{ capitalize(dim) }}</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div v-for="(rules, dimension) in filteredRulesByDimension" :key="dimension" class="mb-4">
                        <div
                            class="font-semibold text-gray-700 mb-2 flex items-center cursor-pointer"
                            @click="toggleDimension(dimension)"
                        >
                            <span>{{ capitalize(dimension) }}</span>
                            <span class="ml-2 text-xs text-gray-400">{{
                                expandedDimensions[dimension] ? '▼' : '▶'
                            }}</span>
                        </div>
                        <div v-show="expandedDimensions[dimension]">
                            <div
                                v-for="rule in rules"
                                :key="rule.id"
                                class="bg-indigo-100 border border-indigo-700 rounded mb-2 p-3 cursor-pointer hover:bg-indigo-300"
                                draggable="true"
                                @dragstart="onDragStart(rule.id)"
                                @click="addRuleToSelected(rule)"
                            >
                                <div class="font-semibold text-gray-800">{{ rule.name }}</div>
                                <div class="text-xs text-gray-600 mt-1">{{ rule.description }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Selected Rules Zone -->
            <section
                class="flex-1 bg-white rounded-lg shadow p-6 border-2 border-indigo-700"
                @dragover.prevent
                @drop="onDrop"
            >
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-800">Selected Rules</h2>
                    <button
                        class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                        @click="exportStagedRules"
                    >
                        Send Query
                    </button>
                    <button
                        class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        @click="clearAllRules"
                    >
                        Clear All
                    </button>
                </div>
                <div class="min-h-[300px] bg-gray-50 rounded p-3 border border-dashed border-gray-300">
                    <div v-if="selectedRules.length === 0" class="text-gray-400 italic text-center mt-8">
                        Drag rules here to add them
                    </div>
                    <div
                        v-for="(rule, idx) in selectedRules"
                        :key="rule.id"
                        :class="[
                            'bg-white border rounded mb-2 p-3 cursor-pointer transition-colors duration-150',
                            selectedRule && selectedRule.id === rule.id
                                ? 'border-indigo-600 bg-indigo-100 shadow-inner'
                                : 'border-gray-200 hover:bg-gray-100',
                            invalidRuleIds.has(rule.id) ? 'border-red-500 bg-red-50' : '',
                        ]"
                        @click="selectRule(rule)"
                    >
                        <div class="font-semibold text-gray-800">{{ rule.name || rule.type }}</div>
                        <div class="text-xs text-gray-500">#{{ idx + 1 }}</div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Rule Details Form -->
        <section class="bg-white rounded-lg shadow p-6 mt-6">
            <div class="flex justify-between items-center border-b pb-3 mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Rule Details</h2>
                <span v-if="selectedRule" class="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium">{{
                    selectedRule.type
                }}</span>
            </div>
            <div v-if="selectedRule">
                <form @submit.prevent="saveRuleDetails">
                    <!-- Common Fields -->
                    <div class="mb-4">
                        <label class="block font-semibold text-gray-700 mb-1">Rule Name (Optional)</label>
                        <input
                            v-model="selectedRule.name"
                            class="border rounded px-3 py-2 w-full"
                            placeholder="Enter a custom rule name"
                        />
                    </div>
                    <div class="mb-4">
                        <label class="block font-semibold text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            v-model="selectedRule.description"
                            class="border rounded px-3 py-2 w-full"
                            rows="3"
                            placeholder="Enter a description for this rule"
                        ></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block font-semibold text-gray-700 mb-1">Violation Tolerance (Optional)</label>
                        <input
                            v-model.number="selectedRule.mostly"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            class="border rounded px-3 py-2 w-full"
                            placeholder="Enter proportion of successfully validated rows to pass"
                        />
                    </div>
                    <!-- Rule Specific Fields -->
                    <template v-for="field in ruleSpecificFields" :key="field.id">
                        <div class="mb-4">
                            <label class="block font-semibold text-gray-700 mb-1">{{ field.label }}</label>

                            <!-- Textarea -->
                            <textarea
                                v-if="field.type === 'textarea'"
                                v-model="selectedRule.specificData[field.id]"
                                :placeholder="field.placeholder"
                                :rows="field.rows || 3"
                                :class="[
                                    'border rounded px-3 py-2 w-full',
                                    invalidFields.has(field.id) ? 'border-red-500 bg-red-50' : '',
                                ]"
                            ></textarea>

                            <!-- Select -->
                            <select
                                v-else-if="field.type === 'select'"
                                v-model="selectedRule.specificData[field.id]"
                                :class="[
                                    'border rounded px-3 py-2 w-full',
                                    invalidFields.has(field.id) ? 'border-red-500 bg-red-50' : '',
                                ]"
                            >
                                <option v-for="option in field.options" :key="option" :value="option">
                                    {{ option }}
                                </option>
                            </select>

                            <!-- Checkbox -->
                            <div v-else-if="field.type === 'checkbox'" class="flex items-center">
                                <input
                                    v-model="selectedRule.specificData[field.id]"
                                    type="checkbox"
                                    class="mr-2"
                                    :class="invalidFields.has(field.id) ? 'border-red-500 ring-1 ring-red-400' : ''"
                                />
                                <span class="text-gray-700 text-sm">{{ field.label }}</span>
                            </div>

                            <!-- Default input (text/number/etc.) -->
                            <input
                                v-else
                                v-model="selectedRule.specificData[field.id]"
                                :type="field.type"
                                :placeholder="field.placeholder"
                                :min="field.min"
                                :max="field.max"
                                :step="field.step"
                                :class="[
                                    'border rounded px-3 py-2 w-full',
                                    invalidFields.has(field.id) ? 'border-red-500 bg-red-50' : '',
                                ]"
                            />

                            <!-- Validation Message -->
                            <p v-if="invalidFields.has(field.id)" class="text-red-500 text-sm mt-1">
                                This field is required.
                            </p>
                        </div>
                    </template>

                    <div class="flex gap-4">
                        <button
                            type="submit"
                            class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 flex-1"
                            @click="saveRuleDetails"
                        >
                            Save Details
                        </button>
                        <button
                            type="button"
                            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex-1"
                            @click="removeSelectedRule"
                        >
                            Remove Rule
                        </button>
                    </div>
                </form>
            </div>
            <div v-else>
                <p class="text-gray-400">Select a rule from the right zone to edit its details.</p>
            </div>
        </section>

        <!-- Notification -->
        <transition name="fade">
            <div
                v-if="notification"
                class="fixed bottom-6 right-6 bg-indigo-600 text-white px-6 py-3 rounded shadow-lg z-50"
            >
                {{ notification }}
            </div>
        </transition>
    </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

import { availableRules, ruleDetails } from '~/constants/quality-rules';
// --- Dataset loading state ---
const datasets = ref([]);
const selectedDataset = ref(datasets.value[0]);
const factoryURL = ref('');
const accessURL = ref('');
const table = ref(false);
const fileType = ref('');

watch(selectedDataset, (newVal) => {
    console.log(newVal);
    const distribution = newVal.distributions?.[0];
    accessURL.value = distribution.access_url?.[0] || 'No AccessURL';
    const url = new URL(accessURL.value);
    factoryURL.value = `${url.protocol}//${url.host}/`;
    fileType.value = distribution.format.label;
    table.value = fileType.value === 'SQL';
    console.log('factoryURL:', factoryURL.value);
    console.log('accessURL:', accessURL.value);
    console.log('fileType:', fileType.value);
    console.log('table:', table.value);
});

function getDatasetDisplayTitle(dataset) {
    const dist = dataset.distributions?.[0];
    if (dist?.title?.en) {
        return (dataset.title?.en || 'Untitled') + ' | ' + (dist.title?.en || 'No Distribution Title');
    }
    return dataset.id || 'Untitled Dataset';
}

async function loadDatasets() {
    try {
        const response = await fetch('https://pistis-market.eu/srv/search/search?filters=dataset&limit=25');
        const json = await response.json();
        const rawDatasets = json.result?.results || [];

        datasets.value = rawDatasets;
    } catch (err) {
        console.error('Error fetching datasets:', err);
    }
}

// call on mounted
onMounted(() => {
    loadDatasets();
});

// // computed to get selected dataset's title
// const selectedDatasetTitle = computed(() => {
//   const ds = datasets.value.find((d) => d.id === selectedDatasetId.value);
//   return ds ? ds.title : '';
// });

// Dimensions
const dimensions = ['accuracy', 'consistency', 'completeness', 'uniqueness', 'validity'];
// State
const selectedDimension = ref('all');
const expandedDimensions = reactive({});
dimensions.forEach((dim) => (expandedDimensions[dim] = false));
const selectedRules = ref([]);
const selectedRule = ref(null);
const notification = ref('');
const invalidFields = ref(new Set());
const invalidRuleIds = ref(new Set());

// Drag & Drop
function onDragStart(ruleId) {
    event.dataTransfer.setData('ruleId', ruleId);
}
function onDrop(event) {
    event.preventDefault();
    const ruleId = event.dataTransfer.getData('ruleId');
    const rule = availableRules.find((r) => r.id === ruleId);
    if (rule) addRuleToSelected(rule);
}

// Filtering
const filteredRulesByDimension = computed(() => {
    if (selectedDimension.value === 'all') {
        // Group by dimension
        return availableRules.reduce((acc, rule) => {
            acc[rule.dimension] = acc[rule.dimension] || [];
            acc[rule.dimension].push(rule);
            return acc;
        }, {});
    } else {
        return {
            [selectedDimension.value]: availableRules.filter((rule) => rule.dimension === selectedDimension.value),
        };
    }
});

// Expand/collapse logic
function toggleDimension(dimension) {
    expandedDimensions[dimension] = !expandedDimensions[dimension];
}

// Add rule to selected
function addRuleToSelected(rule) {
    const alreadySelected = selectedRules.value.find((r) => r.id === rule.id);
    if (!alreadySelected) {
        const details = ruleDetails[rule.id];
        const specificFields = details?.fields || [];

        const specificDataDefaults = {};
        specificFields.forEach((field) => {
            if (field.type === 'checkbox') {
                specificDataDefaults[field.id] = false;
            } else if (field.type === 'number') {
                specificDataDefaults[field.id] = null;
            } else {
                specificDataDefaults[field.id] = '';
            }
        });

        selectedRules.value.push({
            id: rule.id,
            type: rule.name,
            name: '',
            description: '',
            mostly: 1.0,
            specificData: specificDataDefaults,
        });
    }

    const existing = selectedRules.value.find((r) => r.id === rule.id);
    if (existing) {
        selectRule(existing);
    }
}

// Select rule for editing
function selectRule(rule) {
    selectedRule.value = rule;
}

// Remove selected rule
function removeSelectedRule() {
    if (!selectedRule.value) return;
    selectedRules.value = selectedRules.value.filter((r) => r.id !== selectedRule.value.id);
    selectedRule.value = null;
}

// Clear all rules
function clearAllRules() {
    selectedRules.value = [];
    selectedRule.value = null;
}

// Save rule details
function saveRuleDetails() {
    if (!selectedRule.value) return;

    const validation = validateRuleFields(selectedRule.value);
    invalidFields.value = validation.invalidFieldIds;

    if (!validation.isValid) {
        showNotification('Please update all required fields before saving.');
        invalidRuleIds.value.add(selectedRule.value.id);
        return;
    }

    invalidRuleIds.value.delete(selectedRule.value.id);
    showNotification('Rule details saved successfully!');
}

function validateRuleFields(rule) {
    const result = {
        invalidFieldIds: new Set(),
        isValid: true,
    };

    const { specificData, id } = rule;
    const ruleDef = ruleDetails[id];

    if (!ruleDef || !ruleDef.fields) return result;

    ruleDef.fields.forEach((field) => {
        const currentValue = specificData[field.id];
        const defaultValue = field.default ?? getDefaultForType(field.type);

        const isInvalid =
            (field.type === 'checkbox' && currentValue !== true) ||
            (field.type === 'number' && (currentValue === null || currentValue === '')) ||
            (typeof currentValue === 'string' && currentValue.trim() === '') ||
            (Array.isArray(currentValue) && currentValue.length === 0) ||
            currentValue === defaultValue;

        if (isInvalid) {
            result.invalidFieldIds.add(field.id);
        }
    });

    result.isValid = result.invalidFieldIds.size === 0;
    return result;
}

function getDefaultForType(type) {
    switch (type) {
        case 'text':
        case 'textarea':
        case 'select':
            return '';
        case 'number':
            return null;
        default:
            return null;
    }
}

// Notification logic
function showNotification(msg) {
    notification.value = msg;
    setTimeout(() => (notification.value = ''), 2500);
}

// Utility
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Rule-specific fields
const ruleSpecificFields = computed(() => {
    if (!selectedRule.value) return [];
    const details = ruleDetails[selectedRule.value.id];
    return details?.fields || [];
});

// Export selectedRules to GX structure
async function exportStagedRules() {
    if (selectedRules.value.length == 0) {
        showNotification('No quality rules selected.');
        return;
    }
    // Validate all rules before export
    const invalids = selectedRules.value.filter(hasMissingDetails);
    invalidRuleIds.value = new Set(invalids.map((r) => r.id));
    console.log(invalidRuleIds);
    if (invalids.length > 0) {
        showNotification('Please complete all rule configurations before exporting.');
        return;
    }

    const result = selectedRules.value.map((rule) => {
        const { name, description, mostly, specificData } = rule;

        const kwargs = { ...specificData };
        if (mostly !== undefined && mostly !== null && mostly !== 1) {
            kwargs.mostly = parseFloat(mostly);
        }

        const meta = {
            offer_id: selectedDataset.value.id,
        };
        if (name) meta.name = name;
        if (description) meta.description = description;

        return {
            name: rule.type,
            kwargs,
            meta,
        };
    });

    const dataQueryPayload = {
        access_url: accessURL.value,
        table: table.value,
        file_type: fileType.value,
        data_query: result,
    };
    const jsonString = JSON.stringify(dataQueryPayload, null, 2);
    console.log('Exported Rules JSON:', jsonString);

    // Make call to the factory DQA @ ${fatoryURL.value}/srv/data-quality-assessor/api/dqa/query/
    const endpoint = `${factoryURL.value}srv/data-quality-assessor/api/dqa/query/`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonString,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            showNotification('Failed to send query. See console for details.');
        } else {
            const result = await response.json();
            console.log('Server response:', result);
            showNotification('Query successfully sent!');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showNotification('An error occurred while sending the query.');
    }
}

function hasMissingDetails(rule) {
    const validation = validateRuleFields(rule);
    return !validation.isValid;
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
