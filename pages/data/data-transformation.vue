<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useFetch } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

const { data } = useFetch<any[]>('/api/data-transformation/transformation');

const jsonSchema = computed(() => {
    if (!data.value) return null;

    try {
        // If the API returns a string, parse it
        if (typeof data.value === 'string') {
            return JSON.parse(data.value);
        }
        // If the API returns an object, return it directly
        return data.value;
    } catch (error) {
        console.error('Error parsing JSON schema:', error);
        return null;
    }
});

const elements = computed(() => {
    if (!jsonSchema.value) return [];

    return jsonSchema.value.map((item) => ({
        label: item.properties.id.const
            .replace(/_/g, ' ')
            .replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase()),
        content: item,
    }));
});

const elementParams = ref(elements.value.map(() => ({})));
const transformations = ref([]);
const hoveredTransformation = ref(null);
const fileUpload = ref<File | null>(null);
//const responseContent = ref('');
const outputFormat = ref('application/json'); // Default value
const hoveredTitleIndex = ref<number | null>(null);
const hoveredParamIndex = ref<number | null>(null);
const expandedPanels = ref<boolean[]>([]);

const updateParam = (elementIndex, key, newValue) => {
    if (!elementParams.value[elementIndex]) {
        elementParams.value[elementIndex] = {};
    }
    elementParams.value[elementIndex][key] = newValue;
};

const updateArrayParam = (elementIndex, key, newValue) => {
    updateParam(elementIndex, key, newValue);
};

const addTransformation = (index) => {
    const element = elements.value[index];
    const params = element.content.properties.params;
    const requiredFields = params.required || [];
    const currentParams = elementParams.value[index] || {};

    // Check if all required fields have a value
    for (const field of requiredFields) {
        const value = currentParams[field];
        if (
            value === undefined ||
            value === null ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && (value.length === 0 || value.every((item) => item.trim() === '')))
        ) {
            alert(`The field "${field}" is required and must have a non-empty value.`);
            return;
        }
    }
    const panelData = JSON.parse(
        JSON.stringify({
            id: element.content.properties.id.const,
            params: currentParams || {},
        }),
    );
    transformations.value.push(panelData);
};

const deleteTransformation = (index) => {
    transformations.value.splice(index, 1);
    if (transformations.value.length === 0) {
        hoveredTransformation.value = null;
    } else if (
        hoveredTransformation.value &&
        JSON.stringify(hoveredTransformation.value) === JSON.stringify(transformations.value[index])
    ) {
        hoveredTransformation.value = null;
    }
    console.log(`Transformation at index ${index} deleted.`);
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        fileUpload.value = target.files[0];
    }
};

const transformFile = async () => {
    const allTransformations = JSON.stringify(transformations.value, null, 1); // Get the entire JSON array

    const formData = new FormData();
    formData.append('transformation_definition', allTransformations);
    if (fileUpload.value) {
        formData.append('file', fileUpload.value);
    }

    try {
        const contentType = outputFormat.value;

        const response = await $fetch.raw('/api/data-transformation/transformation', {
            method: 'POST',
            body: formData,
            query: {
                Accept: outputFormat.value,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // constcontentType = response.headers.get('Content-Type');
        if (contentType === 'application/json') {
            const data = response._data;
            responseContent.value = JSON.stringify(data, null, 2);
        } else if (contentType?.includes('text/plain')) {
            const data = response._data;
            responseContent.value = data as string;
        } else if (contentType?.includes('text/xml')) {
            const data = response._data;
            responseContent.value = data as string;
        } else if (contentType?.includes('application/vnd.ms-excel')) {
            const blob = new Blob([response._data as string]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'response.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            responseContent.value = 'Excel file downloaded.';
        } else {
            responseContent.value = 'Unsupported response type';
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        responseContent.value = `Error: ${error.message}`;
        console.error('Error:', error);
    }
};

onMounted(() => {
    elements.value.forEach((element, index) => {
        if (element.content.properties.params && element.content.properties.params.properties) {
            elementParams.value[index] = {};
            for (const key in element.content.properties.params.properties) {
                const type = element.content.properties.params.properties[key].type;
                if (type === 'boolean') {
                    elementParams.value[index][key] = false;
                } else if (type === 'array') {
                    elementParams.value[index][key] = [];
                } else {
                    elementParams.value[index][key] = '';
                }
            }
        }
        expandedPanels.value[index] = false; // panels contracted by default
    });
});

const togglePanel = (index: number) => {
    expandedPanels.value[index] = !expandedPanels.value[index];
};
</script>

<template>
    <div class="main-container">
        <div class="editor-container">
            <h2 class="big-bold-title">Transformation catalog</h2>
            <div v-if="elements && elements.length > 0" class="panels-container">
                <div v-for="(element, index) in elements" :key="index" class="panel">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center;">
                            <h3 v-if="element.content.title" style="margin-right: 8px; display: flex; align-items: center">
                                {{ element.content.title }}
                                <span class="tooltip-container">
                                    <Icon
                                        v-if="element.content.description"
                                        icon="heroicons:information-circle"
                                        class="info-icon"
                                        style="cursor: pointer; font-size: 1.3em; margin-left: 6px"
                                        @mouseover="hoveredTitleIndex = index"
                                        @mouseleave="hoveredTitleIndex = null"
                                    />
                                    <span
                                        v-if="hoveredTitleIndex === index && element.content.description"
                                        class="description-tooltip"
                                    >
                                        {{ element.content.description }}
                                    </span>
                                </span>
                            </h3>
                            <h3 v-else-if="element.content.properties.id.const">
                                {{ element.content.properties.id.const }}
                            </h3>
                            <h3 v-else>Element {{ index + 1 }}</h3>
                        </div>
                        <Icon
                            :icon="expandedPanels[index] ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                            class="dropdown-icon"
                            style="cursor: pointer; font-size: 1.5em;"
                            @click="togglePanel(index)"
                        />
                    </div>
                    <template v-if="expandedPanels[index]">
                        <div v-if="element.content.properties.params && element.content.properties.params.properties">
                            <div
                                v-for="(paramSchema, key) in element.content.properties.params.properties"
                                :key="key"
                                class="form-group"
                            >
                                <label :for="`input-${index}-${key}`" style="display: flex; align-items: center">
                                    {{ key }}
                                    <span class="tooltip-container">
                                        <Icon
                                            v-if="paramSchema.description"
                                            icon="heroicons:information-circle"
                                            class="info-icon"
                                            style="cursor: pointer; font-size: 1.1em; margin-left: 4px; margin-right: 4px"
                                            @mouseover="hoveredParamIndex = `${index}-${key}`"
                                            @mouseleave="hoveredParamIndex = null"
                                        />
                                        <span
                                            v-if="hoveredParamIndex === `${index}-${key}` && paramSchema.description"
                                            class="description-tooltip"
                                        >
                                            {{ paramSchema.description }}
                                        </span>
                                    </span>
                                    <span
                                        v-if="
                                            element.content.properties.params.required &&
                                            element.content.properties.params.required.includes(key)
                                        "
                                        class="required"
                                        >*</span
                                    >:
                                </label>
                                <template v-if="paramSchema.type === 'string' && !paramSchema.enum">
                                    <input
                                        :id="`input-${index}-${key}`"
                                        type="text"
                                        class="form-control"
                                        :value="elementParams[index] && elementParams[index][key]"
                                        @input="updateParam(index, key, $event.target.value)"
                                    />
                                </template>
                                <template v-if="paramSchema.type === 'integer'">
                                    <input
                                        :id="`input-${index}-${key}`"
                                        type="number"
                                        class="form-control"
                                        :value="elementParams[index] && elementParams[index][key]"
                                        @input="updateParam(index, key, parseInt($event.target.value))"
                                    />
                                </template>
                                <template v-if="paramSchema.type === 'number'">
                                    <input
                                        :id="`input-${index}-${key}`"
                                        type="number"
                                        class="form-control"
                                        :value="elementParams[index] && elementParams[index][key]"
                                        @input="updateParam(index, key, parseFloat($event.target.value))"
                                    />
                                </template>
                                <template v-if="paramSchema.type === 'boolean'">
                                    <div class="form-check">
                                        <input
                                            :id="`input-${index}-${key}`"
                                            type="checkbox"
                                            class="form-check-input"
                                            :checked="elementParams[index] && elementParams[index][key]"
                                            @change="updateParam(index, key, $event.target.checked)"
                                        />
                                        <label class="form-check-label" :for="`input-${index}-${key}`"></label>
                                    </div>
                                </template>
                                <template
                                    v-if="
                                        paramSchema.type === 'array' &&
                                        paramSchema.items &&
                                        paramSchema.items.type === 'string'
                                    "
                                >
                                    <textarea
                                        :id="`input-${index}-${key}`"
                                        class="form-control"
                                        :value="
                                            elementParams[index] && elementParams[index][key]
                                                ? elementParams[index][key].join(', ')
                                                : ''
                                        "
                                        @input="
                                            updateArrayParam(
                                                index,
                                                key,
                                                $event.target.value.split(',').map((item) => item.trim()),
                                            )
                                        "
                                    ></textarea>
                                    <small class="form-text text-muted">Enter comma-separated values.</small>
                                </template>
                                <template v-if="paramSchema.type === 'string' && paramSchema.enum">
                                    <select
                                        :id="`input-${index}-${key}`"
                                        class="form-control"
                                        :value="elementParams[index] && elementParams[index][key]"
                                        @change="updateParam(index, key, $event.target.value)"
                                    >
                                        <option v-for="option in paramSchema.enum" :key="option" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                </template>

                                <template v-if="Array.isArray(paramSchema.type)">
                                    <div class="form-group">
                                        <input
                                            :id="`input-${index}-${key}`"
                                            type="text"
                                            class="form-control"
                                            :value="elementParams[index] && elementParams[index][key]?.value"
                                            @input="
                                                updateParam(index, key, {
                                                    value: $event.target.value,
                                                    type: elementParams[index][key]?.type,
                                                })
                                            "
                                        />
                                        <select
                                            :id="`select-${index}-${key}`"
                                            class="form-control mt-2"
                                            :value="elementParams[index] && elementParams[index][key]?.type"
                                            @change="
                                                updateParam(index, key, {
                                                    value: elementParams[index][key]?.value,
                                                    type: $event.target.value,
                                                })
                                            "
                                        >
                                            <option v-for="type in paramSchema.type" :key="type" :value="type">
                                                {{ type }}
                                            </option>
                                        </select>
                                    </div>
                                </template>
                                <template
                                    v-else-if="
                                        paramSchema.type &&
                                        !['string', 'integer', 'number', 'boolean', 'array'].includes(paramSchema.type)
                                    "
                                >
                                    <p class="text-warning">Unsupported type: {{ paramSchema.type }} for {{ key }}</p>
                                </template>
                            </div>
                        </div>
                        <div v-else>
                            <p class="text-muted">No parameters defined for this element.</p>
                        </div>
                        <button @click="addTransformation(index)">Add Transformation</button>
                    </template>
                </div>
            </div>
            <div v-else>
                <p>No elements in the JSON array.</p>
            </div>
        </div>
        <div class="middle-panel">
            <div class="json-panel">
                <h2 class="big-bold-title">Transformation Definition JSON</h2>
                <div class="json-panel-content">
                    <!-- Left Section: Transformations -->
                    <div class="json-panel-left">
                        <div v-for="(transformation, index) in transformations" :key="index" class="transformation-box">
                            <div
                                class="transformation-content"
                                @mouseover="hoveredTransformation = transformation"
                                @mouseleave="hoveredTransformation = null"
                            >
                                <p>Transformation {{ index + 1 }}</p>
                                <button class="delete-button" @click="deleteTransformation(index)">×</button>
                            </div>
                        </div>
                        <div v-if="hoveredTransformation" class="hovered-json">
                            <pre>{{ JSON.stringify(hoveredTransformation, null, 2) }}</pre>
                        </div>
                    </div>

                    <!-- Right Section: Full JSON -->
                    <div class="json-panel-right">
                        <h3>Full Transformations JSON</h3>
                        <pre>{{ JSON.stringify(transformations, null, 2) }}</pre>
                    </div>
                </div>
            </div>
            <div class="execution-container">
                <div class="p-4 bg-neutral-100">
                    <h2 class="big-bold-title">Transformation execution</h2>
                    <br />
                    <label for="fileUpload" class="block text-sm font-medium text-neutral-700">Upload Dataset:</label>
                    <input
                        id="fileUpload"
                        type="file"
                        class="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        @change="handleFileChange"
                    />
                    <label for="outputFormat" class="block text-sm font-medium text-neutral-700">Output format:</label>
                    <select
                        id="outputFormat"
                        v-model="outputFormat"
                        class="mt-1 block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    >
                        <option value="text/plain">CSV</option>
                        <option value="application/vnd.ms-excel">Excel</option>
                        <option value="text/xml">XML</option>
                        <option value="application/json">JSON</option>
                    </select>
                </div>
                <button @click="transformFile">Transform File</button>
                <textarea
                    id="responseContent"
                    class="form-control"
                    readonly
                    rows="10"
                    placeholder="Response content will appear here..."
                ></textarea>
            </div>
        </div>
    </div>
</template>

<style scoped>
.panels-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
    align-items: start; /* Ensure each panel only expands itself */
}

.panel {
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 5px;
    background-color: #f9f9f9;
    /* Remove any height or flex that could cause stretching */
    /* height: unset; */
    /* display: block; */
}

.panel h3 {
    margin-top: 0;
    font-weight: bold;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
}


.panel button {
    background-color: #5732d0cc;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    color: #333;
}

.form-control {
    width: calc(100% - 12px);
    /* Adjust for padding */
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 3px;
    box-sizing: border-box;
    font-size: 1rem;
    color: #555;
}

.form-control:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-check {
    display: flex;
    align-items: center;
}

.form-check-input {
    margin-right: 10px;
}

.form-check-label {
    margin-bottom: 0;
    color: #555;
}

.form-text {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 3px;
}

select.form-control {
    appearance: none;
    /* Remove default arrow */
    background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position-x: calc(100% - 10px);
    background-position-y: 50%;
    padding-right: 30px;
}

button {
    padding: 10px 15px;
    background-color: #5632d0;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
}

button:hover {
    background-color: #3b218fff;
}

.text-warning {
    color: #ffc107;
    font-size: 0.875rem;
}

.text-muted {
    color: #6c757d;
    font-size: 0.875rem;
}

.main-container {
    display: flex;
    gap: 20px;
}

.editor-container {
    flex: 2;
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 5px;
}

.middle-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.execution-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 5px;
}

.json-panel {
    max-height: calc(2 * var(--transformation-box-height));
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 5px;
    background-color: #f9f9f9;
    overflow-y: auto;
    max-height: 80vh;
}

.json-panel h2 {
    margin-top: 0;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
}

.json-panel-content {
    display: flex;
    gap: 20px;
}

.json-panel-left {
    flex: 1;
}

.json-panel-right {
    flex: 1;
}

.json-panel-right h3 {
    margin-top: 0;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
}

.json-panel pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 0.9rem;
    color: #333;
}

.transformation-box {
    --transformation-box-height: 150px;
    /* Example height, adjust as needed */
    height: var(--transformation-box-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f1f1f1;
}

.transformation-content {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.transformation-content p {
    margin: 0;
    font-size: 1rem;
    color: #333;
}

.delete-button {
    background: none;
    border: none;
    color: #ff0000;
    font-size: 1.5rem;
    cursor: pointer;
}

.delete-button:hover {
    color: #cc0000;
}

.hovered-json {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.hovered-json pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 0.9rem;
    color: #333;
}

.bordered {
    border: 2px solid #5632d0;
    padding: 10px;
    border-radius: 5px;
}

.info-icon {
    color: #5632d0;
    margin-left: 4px;
}

.tooltip-container {
    position: relative;
    display: inline-block;
}

.description-tooltip {
    position: absolute;
    left: auto;
    right: auto;
    top: auto;
    bottom: auto;
    margin-left: 8px;
    background: #f9f9f9;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.95em;
    color: #333;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    white-space: normal;
    transform: translateY(-50%);
}

.big-bold-title {
    font-size: 1.4rem;
    font-weight: bold;
}

.dropdown-icon {
    margin-left: 8px;
    color: #5632d0;
    transition: transform 0.2s;
}
.dropdown-icon:hover {
    color: #3b218f;
    transform: scale(1.1);
}
</style>
