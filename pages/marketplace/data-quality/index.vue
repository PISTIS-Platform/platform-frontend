<!-- filepath: src/App.vue -->
<template>
    <div class="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-2 md:mb-0">Data Quality Rules Configuration</h1>
        </header>

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
                                class="border rounded px-3 py-2 w-full"
                            ></textarea>

                            <!-- Select -->
                            <select
                                v-else-if="field.type === 'select'"
                                v-model="selectedRule.specificData[field.id]"
                                class="border rounded px-3 py-2 w-full"
                            >
                                <option v-for="option in field.options" :key="option" :value="option">
                                    {{ option }}
                                </option>
                            </select>

                            <!-- Checkbox -->
                            <div v-else-if="field.type === 'checkbox'" class="flex items-center">
                                <input v-model="selectedRule.specificData[field.id]" type="checkbox" class="mr-2" />
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
                                class="border rounded px-3 py-2 w-full"
                            />
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

// import RulesConfig from '~/composables/rules-config';
import { availableRules, ruleDetails } from '~/constants/quality-rules';

// Dimensions
const dimensions = ['accuracy', 'consistency', 'completeness', 'uniqueness', 'validity'];
// console.log('Available Rules:', RulesConfig.availableRules);
// State
const selectedDimension = ref('all');
const expandedDimensions = reactive({});
dimensions.forEach((dim) => (expandedDimensions[dim] = false));
const selectedRules = ref([]);
const selectedRule = ref(null);
const notification = ref('');

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
                specificDataDefaults[field.id] = field.min ?? 0;
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
    // Update ruleSet logic here if needed
    showNotification('Rule details saved successfully!');
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
