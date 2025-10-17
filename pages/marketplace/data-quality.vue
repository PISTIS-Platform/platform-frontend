<script setup lang="ts">
const { t } = useI18n();
import * as R from 'ramda';

import type { Dimension } from '~/constants/quality-rules';
import { availableRules, dimensions, ruleDetails } from '~/constants/quality-rules';

// --- Dataset loading state ---
const showTutorial = ref(true);
const steps = [
    {
        label: 'Step 1: Choose a Dataset',
        content: `
      <p>Before constructing a query, you must first select a dataset.</p>
      <ul class="list-disc list-inside">
        <li>Use the dropdown menu next to <strong>"Select Dataset"</strong> to find and choose a published dataset.</li>
        <li>Click the dataset name to select it. The selected dataset will then appear in the dropdown.</li>
      </ul>
    `,
    },
    {
        label: 'Step 2: Select Quality Rules',
        content: `
      <p>Once a dataset is selected, browse the <strong>Available Quality Rules</strong> panel.</p>
      <p>Rules are grouped into the following five dimensions:</p>
      <ul class="list-disc list-inside">
        <li><strong>Accuracy</strong>: Ensures data is correct and meets expected constraints.</li>
        <li><strong>Consistency</strong>: Verifies consistent data across sources or fields.</li>
        <li><strong>Completeness</strong>: Checks for missing or null values.</li>
        <li><strong>Uniqueness</strong>: Ensures values are unique across specified columns.</li>
        <li><strong>Validity</strong>: Confirms data follows the expected format or type.</li>
      </ul>
      <p class="mt-2">To add a rule to your query, drag it from the <strong>Available Quality Rules</strong> panel into the <strong>Selected Rules</strong> panel.</p>
      <p class="mt-2"><strong>Note:</strong> Rules are not unique—you can add the same rule multiple times to target different columns. For example, <code>ExpectColumnValueToNotBeNull</code> can be reused for multiple fields.</p>
    `,
    },
    {
        label: 'Step 3: Configure Selected Rules',
        content: `
      <p>After adding rules, each must be configured based on its type.</p>
      <ul class="list-disc list-inside">
        <li>Click a rule in the <strong>Selected Rules</strong> panel.</li>
        <li>The <strong>Rule Details</strong> section will appear at the bottom of the page with options.</li>
        <li>Fill out the required and optional fields.</li>
        <li>Click <strong>Save Details</strong> to save your configuration.</li>
      </ul>
    `,
    },
    {
        label: 'Step 4: Submit the Quality Query',
        content: `
      <p>Once all rules are configured, you're ready to run the query.</p>
      <ul class="list-disc list-inside">
        <li>Click the <strong>Send Query</strong> button next to the dataset name.</li>
        <li>This validates and submits your query to the data owner's factory.</li>
        <li>Results will appear on the same page, usually within seconds.</li>
      </ul>
    `,
    },
];

const offerQueryDetails = ref({
    ownerFactoryURL: '',
    accessURL: '',
    fileType: '',
    table: false,
});

const selected = ref<
    | {
          id: string;
          title: string;
          description: string;
          distributions: Record<string, any>[];
      }
    | undefined
>(undefined);

watch(selected, () => {
    if (!selected.value) return;
    const distribution = selected.value.distributions?.[0];
    offerQueryDetails.value.accessURL = distribution.access_url?.[0];
    const url = new URL(offerQueryDetails.value.accessURL);
    offerQueryDetails.value.ownerFactoryURL = `${url.protocol}//${url.host}/`;
    offerQueryDetails.value.fileType = distribution.format.label;
    offerQueryDetails.value.table = offerQueryDetails.value.fileType === 'SQL';
    queryResult.value = null;
});

const { data: datasetsData } = useFetch<Record<string, any>[]>(`/api/datasets/get-all-foreign-offers`, {
    query: {
        nonFree: true,
    },
    server: true,
});

const sortByDateDesc = R.sortWith([R.descend(R.prop('modified'))]);

const transformedDatasets = computed(() => {
    if (!datasetsData.value || !datasetsData.value?.length) {
        return [];
    }
    return sortByDateDesc(
        datasetsData.value.map((dataset: Record<string, any>) => ({
            id: dataset.id,
            title: dataset.title.en,
            description: dataset.description.en,
            distributions: dataset.distributions,
            modified: dataset.modified,
        })),
    );
});

// Dimensions
// const dimensions = ['accuracy', 'consistency', 'completeness', 'uniqueness', 'validity'];
// State
const selectedDimension = ref<'all' | Dimension>('all');
const expandedDimensions = reactive({});
dimensions.forEach((dim) => (expandedDimensions[dim] = false));
const selectedRules = ref([]);
const selectedRule = ref(null);
const notification = ref('');
const invalidFields = ref(new Set());
const invalidRuleIds = ref(new Set());
const queryResult = ref(null);
const dimensionRows = computed(() => {
    if (!queryResult.value ?? !queryResult.value.content) return [];

    const scores = queryResult.value.content.dimension_scores ?? {};

    return dimensions.map((dimension) => {
        const score = scores[dimension];

        return {
            dimension,
            score: score,
            status: score === null ? 'Not Evaluated' : score === 1 ? '✅ Pass' : score === 0 ? '❌ Fail' : '',
        };
    });
});

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
            acc[rule.dimension] = acc[rule.dimension] ?? [];
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
    const details = ruleDetails[rule.id];
    const specificFields = details?.fields ?? [];

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

    // Generate a unique ID for each rule instance
    const uniqueInstanceId = `${rule.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const newRuleInstance = {
        id: uniqueInstanceId,
        ruleTypeId: rule.id, // Track the original rule's ID
        type: rule.name,
        name: '',
        description: '',
        mostly: 1.0,
        specificData: specificDataDefaults,
    };

    selectedRules.value.push(newRuleInstance);
    selectRule(newRuleInstance);
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
        showNotification(t('data.quality.notifications.invalidRuleDetails'));
        invalidRuleIds.value.add(selectedRule.value.id);
        return;
    }

    invalidRuleIds.value.delete(selectedRule.value.id);
    showNotification(t('data.quality.notifications.validRuleDetails'));
}

function validateRuleFields(rule) {
    const result = {
        invalidFieldIds: new Set(),
        isValid: true,
    };

    const { specificData } = rule;
    const ruleDef = ruleDetails[rule.ruleTypeId];

    if (!ruleDef || !ruleDef.fields) return result;

    ruleDef.fields.forEach((field) => {
        if (!field.required) return;

        const currentValue = specificData[field.id];
        const defaultValue = field.default ?? getDefaultForType(field.type);

        const isInvalid =
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
    const details = ruleDetails[selectedRule.value.ruleTypeId];
    return details?.fields ?? [];
});

// Export selectedRules to GX structure
async function exportStagedRules() {
    console.log(selected.value);
    if (!selected.value) {
        showNotification(t('data.quality.notifications.selectDataset'));
        return;
    }

    if (selectedRules.value.length === 0) {
        showNotification(t('data.quality.notifications.noRulesSelected'));
        return;
    }

    const invalids = selectedRules.value.filter(hasMissingDetails);
    invalidRuleIds.value = new Set(invalids.map((r) => r.id));

    if (invalids.length > 0) {
        showNotification(t('data.quality.notifications.missingConfigurations'));
        return;
    }

    const result = selectedRules.value.map((rule) => {
        const { name, description, mostly, specificData } = rule;

        const kwargs = { ...specificData };
        if (mostly !== undefined && mostly !== null && mostly !== 1) {
            kwargs.mostly = parseFloat(mostly);
        }

        const meta = {
            offer_id: selected.value.id,
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
        access_url: offerQueryDetails.value.accessURL,
        table: offerQueryDetails.value.table,
        file_type: offerQueryDetails.value.fileType,
        data_query: result,
    };

    const jsonString = JSON.stringify(dataQueryPayload, null, 2);
    console.log('Exported Rules JSON:', jsonString);
    console.log(`${offerQueryDetails.value.ownerFactoryURL}srv/data-quality-assessor/api/dqa/query/`);

    const endpoint = `${offerQueryDetails.value.ownerFactoryURL}srv/data-quality-assessor/api/dqa/query/`;

    try {
        const { data, error, status } = await useFetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonString,
        });

        if (error.value || status.value >= 400) {
            console.error('Server error:', error.value);
            showNotification(t('data.quality.notifications.failedQuery'));
        } else {
            queryResult.value = data.value;
            console.log('Server response:', queryResult.value);
            showNotification(t('data.quality.notifications.successfulQuery'));
        }
    } catch (err) {
        console.error('Fetch error:', err);
        showNotification(t('data.quality.notifications.fetchError'));
    }
}

function hasMissingDetails(rule) {
    const validation = validateRuleFields(rule);
    return !validation.isValid;
}
</script>

<template>
    <UCard>
        <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
            <!-- Header -->
            <header
                class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-300 pb-6"
            >
                <h3 class="text-4xl font-semibold text-gray-900">
                    {{ t('data.quality.headers.title') }}
                </h3>
                <div class="mb-4 flex justify-end">
                    <UButton size="sm" color="gray" variant="soft" @click="showTutorial = !showTutorial">
                        {{ showTutorial ? 'Hide Tutorial' : 'Show Tutorial' }}
                    </UButton>
                </div>
            </header>

            <!-- Tutorial Card -->
            <UCard v-show="showTutorial" class="shadow-sm border border-gray-200 p-6">
                <h1 class="text-2xl mb-6">How to Use the Data Quality Query Page</h1>

                <UAccordion :items="steps">
                    <template #item="{ item }">
                        <div class="text-gray-700 leading-relaxed" v-html="item.content" />
                    </template>
                </UAccordion>
            </UCard>

            <!-- Dataset Selector -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <UIcon name="oui:pages-select" class="w-10 h-10 text-gray-500" />
                            <SubHeading
                                :title="$t('data.quality.headers.dataSelectorTitle')"
                                :info="$t('data.quality.headers.dataSelectorInfo')"
                            />
                        </div>
                        <div>
                            <button
                                class="bg-secondary-500 text-white px-3 py-2 rounded text-sm hover:bg-secondary-600"
                                @click="exportStagedRules"
                            >
                                {{ t('data.quality.button.sendQuery') }}
                            </button>
                        </div>
                    </div>
                </template>
                <USelectMenu
                    v-model="selected"
                    searchable
                    :search-attributes="['title', 'description']"
                    :options="transformedDatasets"
                    option-attribute="title"
                    :placeholder="$t('data.quality.placeholder.datasetSelector')"
                >
                    <template #option="{ option: dataset }">
                        <div class="flex flex-col gap-0.5">
                            <span class="font-semibold">{{ dataset.title }}</span>
                            <span class="text-gray-500 text-sm line-clamp-1">{{ dataset.description }}</span>
                        </div>
                    </template>
                </USelectMenu>
            </UCard>
            <!-- <section class="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <label class="font-semibold text-gray-700 text-sm">
                            {{ t('data.quality.headers.selectData') }}
                        </label>
                        <select v-model="selectedDataset"
                            class="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pistis-500 focus:border-pistis-500"
                            @change="$event.target.blur()">
                            <option v-for="ds in datasets" :key="ds.id" :value="ds">
                                {{ getDatasetDisplayTitle(ds) }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <button class="bg-secondary-500 text-white px-3 py-2 rounded text-sm hover:bg-secondary-600"
                            @click="exportStagedRules">
                            {{ t('data.quality.button.sendQuery') }}
                        </button>
                    </div>
                </div>
            </section> -->
            <section v-if="queryResult" class="bg-white rounded-lg shadow p-6 border border-gray-200">
                <table class="min-w-full text-sm text-left text-gray-700">
                    <thead class="bg-gray-100">
                        <tr>
                            <th>Dimension</th>
                            <th>Score (0-1)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="row in dimensionRows"
                            :key="row.dimension"
                            :class="row.score === 1 ? 'bg-green-50' : row.score === 0 ? 'bg-red-50' : 'bg-gray-50'"
                        >
                            <td class="capitalize">{{ row.dimension }}</td>
                            <td>{{ typeof row.score === 'number' ? row.score.toFixed(2) : '—' }}</td>
                            <td>{{ row.status }}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
            <!-- Zones -->
            <div class="flex flex-col md:flex-row gap-8 min-h-[500px]">
                <!-- Available Rules Zone -->
                <section class="flex-1 bg-white rounded-lg shadow p-6 border">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-semibold text-gray-800">
                            {{ t('data.quality.headers.availableRules') }}
                        </h2>
                        <div class="flex items-center gap-2">
                            <label class="text-sm font-medium text-gray-600">
                                {{ t('data.quality.headers.dimFilter') }}
                            </label>
                            <select
                                v-model="selectedDimension"
                                class="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pistis-500 focus:border-pistis-500"
                            >
                                <option value="all">All Dimensions</option>
                                <option v-for="dim in dimensions" :key="dim" :value="dim">{{ capitalize(dim) }}</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <div v-for="(rules, dimension) in filteredRulesByDimension" :key="dimension" class="mb-4">
                            <div
                                :class="[
                                    'font-semibold flex items-center justify-between px-4 py-2 mb-3 rounded-md shadow-sm transition-colors duration-200 cursor-pointer',
                                    expandedDimensions[dimension]
                                        ? 'bg-gray-100'
                                        : 'bg-white hover:bg-gray-100 text-gray-800',
                                ]"
                                @click="toggleDimension(dimension)"
                            >
                                <div>{{ capitalize(dimension) }}</div>
                                <div class="text-sm">
                                    {{ expandedDimensions[dimension] ? '▾' : '▸' }}
                                </div>
                            </div>
                            <div v-show="expandedDimensions[dimension]">
                                <div
                                    v-for="rule in rules"
                                    :key="rule.id"
                                    class="bg-pistis-100 border border-pistis-700 rounded mb-2 p-3 cursor-pointer hover:bg-pistis-300"
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
                <section class="flex-1 bg-white rounded-lg shadow p-6 border" @dragover.prevent @drop="onDrop">
                    <div class="flex items-center mb-4 justify-between">
                        <h2 class="text-lg font-semibold text-gray-800">
                            {{ t('data.quality.headers.selectedRules') }}
                        </h2>
                        <div class="flex gap-1">
                            <button
                                class="bg-primary-500 text-white px-3 py-1 rounded text-sm hover:bg-primary-600"
                                @click="clearAllRules"
                            >
                                {{ t('data.quality.button.clearAll') }}
                            </button>
                        </div>
                    </div>
                    <div class="min-h-[300px] bg-gray-50 rounded p-3 border border-dashed border-gray-300">
                        <div v-if="selectedRules.length === 0" class="text-gray-400 italic text-center mt-8">
                            {{ t('data.quality.placeholder.selectedRules') }}
                        </div>
                        <div
                            v-for="(rule, idx) in selectedRules"
                            :key="rule.id"
                            :class="[
                                'bg-white border rounded mb-2 p-3 cursor-pointer transition-colors duration-150',
                                selectedRule && selectedRule.id === rule.id
                                    ? 'border-pistis-600 bg-pistis-100 shadow-inner'
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
                    <div
                        v-if="selectedRule"
                        class="bg-pistis-500 text-white px-3 py-1 rounded-full text-xs font-medium"
                    >
                        {{ selectedRule.type }}
                    </div>
                </div>
                <div v-if="selectedRule">
                    <form @submit.prevent="saveRuleDetails">
                        <!-- Common Fields -->
                        <div class="mb-4">
                            <label class="block font-semibold text-gray-700 mb-1">
                                {{ t('data.quality.form.ruleName') }}
                            </label>
                            <input
                                v-model="selectedRule.name"
                                class="border rounded px-3 py-2 w-full"
                                placeholder="Enter a custom rule name"
                            />
                        </div>
                        <div class="mb-4">
                            <label class="block font-semibold text-gray-700 mb-1">
                                {{ t('data.quality.form.description') }}
                            </label>
                            <textarea
                                v-model="selectedRule.description"
                                class="border rounded px-3 py-2 w-full"
                                rows="3"
                                placeholder="Enter a description for this rule"
                            ></textarea>
                        </div>
                        <div class="mb-4">
                            <label class="block font-semibold text-gray-700 mb-1">
                                {{ t('data.quality.form.mostly') }}
                            </label>
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
                        <hr class="my-6 border-t border-gray-300" />
                        <!-- Rule Specific Fields -->
                        <div v-for="field in ruleSpecificFields" :key="`field-${field.id}`">
                            <div class="mb-4">
                                <label class="block font-semibold text-gray-700 mb-1">
                                    {{ field.label }}
                                    <span v-if="field.required" class="text-red-500 ml-1">*</span>
                                </label>

                                <!-- Textarea -->
                                <textarea
                                    v-if="field.type === 'textarea'"
                                    v-model="selectedRule.specificData[field.id]"
                                    :placeholder="field.placeholder"
                                    :rows="field.rows ?? 3"
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
                                    {{ t('data.quality.notifications.validationError') }}
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <button
                                type="submit"
                                class="bg-secondary-500 text-white px-4 py-2 rounded hover:bg-secondary-600 flex-1"
                                @click="saveRuleDetails"
                            >
                                {{ t('data.quality.button.saveDetails') }}
                            </button>
                            <button
                                type="button"
                                class="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 flex-1"
                                @click="removeSelectedRule"
                            >
                                {{ t('data.quality.button.removeRule') }}
                            </button>
                        </div>
                    </form>
                </div>
                <div v-else>
                    <p class="text-gray-400">{{ t('data.quality.placeholder.ruleDetails') }}</p>
                </div>
            </section>

            <!-- Notification -->
            <transition name="fade">
                <div
                    v-if="notification"
                    class="fixed bottom-6 right-6 bg-pistis-600 text-white px-6 py-3 rounded shadow-lg z-50"
                >
                    {{ notification }}
                </div>
            </transition>
        </div>
    </UCard>
</template>

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
