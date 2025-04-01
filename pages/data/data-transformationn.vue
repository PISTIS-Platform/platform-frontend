<template>
    <div class="main-container">
        <div class="editor-container">
            <h2>Edit Elements</h2>
            <div v-if="elements && elements.length > 0" class="panels-container">
                <div v-for="(element, index) in elements" :key="index" class="panel">
                    <h3 v-if="element.properties.id.const">{{ element.properties.id.const }}</h3>
                    <h3 v-else>Element {{ index + 1 }}</h3>
                    <div v-if="element.properties.params && element.properties.params.properties">
                        <div
                            v-for="(paramSchema, key) in element.properties.params.properties"
                            :key="key"
                            class="form-group"
                        >
                            <label :for="`input-${index}-${key}`"
                                >{{ key }}
                                <span
                                    v-if="
                                        element.properties.params.required &&
                                        element.properties.params.required.includes(key)
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
                </div>
                <button @click="saveChanges">Save Changes</button>
            </div>
            <div v-else>
                <p>No elements in the JSON array.</p>
            </div>
        </div>
        <div class="json-panel">
            <h2>Transformation JSON</h2>
            <pre>{{ JSON.stringify(transformations, null, 2) }}</pre>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const jsonData = [
    {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Generated schema for Root',
        type: 'object',
        properties: {
            id: {
                const: 'datetime_harmonizer',
            },
            params: {
                type: 'object',
                properties: {
                    variables: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                    output_format: {
                        type: 'string',
                    },
                },
                required: [],
            },
        },
        required: ['id', 'params'],
    },
    {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Generated schema for Root',
        type: 'object',
        properties: {
            id: {
                const: 'numerical_normalization',
            },
            params: {
                type: 'object',
                properties: {
                    variables: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                    normalization_type: {
                        type: 'string',
                        enum: ['minmax', 'zscore'],
                    },
                    replace_column: {
                        type: 'boolean',
                    },
                },
                required: ['variables', 'normalization_type'],
            },
        },
        required: ['id', 'params'],
    },
    {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Generated schema for Root',
        type: 'object',
        properties: {
            id: {
                const: 'outlier_management',
            },
            params: {
                type: 'object',
                properties: {
                    variables: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                    outlier_criteria: {
                        type: 'string',
                        enum: ['zscore', 'iqr'],
                    },
                    outlier_threshold: {
                        type: 'number',
                    },
                    outlier_action: {
                        type: 'string',
                        enum: ['remove', 'replace'],
                    },
                    replacement: {
                        type: 'string',
                        enum: ['mean', 'closest_limit'],
                    },
                },
                required: ['variables', 'outlier_criteria', 'outlier_action'],
            },
        },
        required: ['id', 'params'],
    },
    {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Generated schema for Root',
        type: 'object',
        properties: {
            id: {
                const: 'remove_column',
            },
            params: {
                type: 'object',
                properties: {
                    variables: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
                required: ['variables'],
            },
        },
        required: ['id', 'params'],
    },
    {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Generated schema for Root',
        type: 'object',
        properties: {
            id: {
                const: 'remove_missing_registries',
            },
            params: {
                type: 'object',
                properties: {
                    variables: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            },
        },
        required: ['id', 'params'],
    },
    {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Generated schema for Root',
        type: 'object',
        properties: {
            id: {
                const: 'replace',
            },
            params: {
                type: 'object',
                properties: {
                    variables: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                    replacements: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                search: {
                                    type: 'string',
                                },
                                replacement: {
                                    type: 'string',
                                },
                                regex: {
                                    type: 'boolean',
                                },
                            },
                            required: ['search', 'replacement'],
                        },
                    },
                },
                required: ['replacements'],
            },
        },
        required: ['id', 'params'],
    },
    {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Generated schema for Root',
        type: 'object',
        properties: {
            id: {
                const: 'replace_missing_registries_fixed',
            },
            params: {
                type: 'object',
                properties: {
                    variables: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                    value: {
                        type: 'string',
                    },
                },
                required: ['value'],
            },
        },
        required: ['id', 'params'],
    },
];

const elements = ref([...jsonData]);
const elementParams = ref(elements.value.map(() => ({})));
const transformations = ref([]);

const updateParam = (elementIndex, key, newValue) => {
    if (!elementParams.value[elementIndex]) {
        elementParams.value[elementIndex] = {};
    }
    elementParams.value[elementIndex][key] = newValue;
};

const updateArrayParam = (elementIndex, key, newValue) => {
    updateParam(elementIndex, key, newValue);
};

const saveChanges = () => {
    const updatedData = elements.value.map((element, index) => ({
        id: element.properties.id.const,
        params: elementParams.value[index] || {},
    }));
    console.log('Updated Data:', updatedData);
    alert('Changes saved (check console)!');
};

const addTransformation = (index) => {
    const panelData = {
        id: elements.value[index].properties.id.const,
        params: elementParams.value[index] || {},
    };
    transformations.value.push(panelData);
    console.log('Panel Data Added:', panelData);
};

onMounted(() => {
    elements.value.forEach((element, index) => {
        if (element.properties.params && element.properties.params.properties) {
            elementParams.value[index] = {};
            for (const key in element.properties.params.properties) {
                const type = element.properties.params.properties[key].type;
                if (type === 'boolean') {
                    elementParams.value[index][key] = false;
                } else if (type === 'array') {
                    elementParams.value[index][key] = [];
                } else {
                    elementParams.value[index][key] = '';
                }
            }
        }
    });
});
</script>

<style scoped>
.panels-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Adjust minmax as needed */
    gap: 20px;
    margin-bottom: 20px;
}

.panel {
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.panel h3 {
    margin-top: 0;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
}

.form-control {
    width: calc(100% - 12px); /* Adjust for padding */
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
    appearance: none; /* Remove default arrow */
    background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position-x: calc(100% - 10px);
    background-position-y: 50%;
    padding-right: 30px;
}

button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
}

button:hover {
    background-color: #0056b3;
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
}

.json-panel {
    flex: 1;
    border: 1px solid #ccc;
    padding: 15px;
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

.json-panel pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 0.9rem;
    color: #333;
}
</style>
