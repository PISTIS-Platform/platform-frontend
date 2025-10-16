<template>
    <th class="table-header p-4 min-w-[300px] max-h-[100px]">
        <div class="font-normal">
            <div class="grid grid-cols-[40px_auto] gap-2">
                <!-- Status indicators -->
                <div class="flex justify-center">
                    <UTooltip
                        v-if="!selectedColumn.name"
                        text="Please select one of the suggested properties belonging to the PISTIS Data Model."
                        :ui="{ width: 'max-w-2xl', base: 'text-wrap' }"
                    >
                        <StatusBubble class="inactive">
                            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
                        </StatusBubble>
                    </UTooltip>

                    <UTooltip
                        v-else-if="!transformable"
                        text="The data type of the chosen property and the data type of the data itself do not match/are not convertible. Please choose a fitting property."
                        :ui="{ width: 'max-w-3xl', base: 'text-wrap' }"
                    >
                        <StatusBubble class="error">
                            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
                        </StatusBubble>
                    </UTooltip>

                    <UTooltip
                        v-else
                        text="The data type of the chosen property matches the data type of the data itself."
                        :ui="{ width: 'max-w-2xl', base: 'text-wrap' }"
                    >
                        <StatusBubble class="success">
                            <UIcon name="i-heroicons-check" class="w-3 h-3" />
                        </StatusBubble>
                    </UTooltip>
                </div>

                <!-- Select dropdown -->
                <USelectMenu
                    v-model="search"
                    :options="liveSearchResult"
                    option-attribute="name"
                    searchable
                    :clear-search-on-close="false"
                    :clearable="false"
                    @update:model-value="selectOption"
                >
                    <!-- ✅ Selected option display -->
                    <template #label>
                        <div class="select-field">
                            {{ selectedColumn.name }}
                            <strong class="select-field-datatype text-secondary-400">
                                {{ selectedColumn.dataType }}
                            </strong>
                        </div>
                    </template>

                    <!-- Options list rendering -->
                    <template #option="{ option }">
                        <div class="option flex flex-col justify-between items-start w-full">
                            <span class="option-name flex gap-2">
                                {{ option.name }}
                                <a
                                    id="option-name-uri"
                                    :href="option.nameURI"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="inline-flex"
                                    @click.stop
                                >
                                    <UIcon name="i-ph-info-bold" class="w-4 h-4" />
                                </a>
                            </span>
                            <span class="font-bold text-secondary-400">{{ option.dataType }}</span>
                        </div>
                    </template>

                    <!-- No results -->
                    <template #empty>
                        <span>No matching properties found</span>
                    </template>
                </USelectMenu>
            </div>
        </div>
    </th>
</template>

<script setup>
import { useDataEnrichmentStore } from '~/store/dataEnrichment';

// Props
const props = defineProps({
    column: {
        type: Object,
        required: true,
    },
    id: {
        type: Number,
        required: true,
    },
    // bus: Object,
});

// Emits
const emit = defineEmits(['selected']);

// Store
const store = useDataEnrichmentStore();
const dataTypeTransformCompatibility = computed(() => store.dataTypeTransformCompatibility);
const columnsStatus = computed(() => store.columnsStatus);
const liveSearchResult = computed(() => store.liveSearchResult);

const { selectColumn, setColumnStatus, setError } = store;

// Toast
const toast = useToast();

// Reactive state
const search = ref({});
const selected = ref(false);
const dataType = ref(props.column.dataType || '');
const transformable = ref(true);
const initialValue = ref(props.column);
const selectedColumn = ref(props.column);

// Methods
const selectOption = (value) => {
    if (!value) return;

    if (isUnique(value.name)) {
        selected.value = true;
        emit('selected');

        const columnId = props.id;
        const name = value.name;
        selectedColumn.value = value;

        transformable.value = isTransformable(dataType.value, selectedColumn.value.dataType);

        setColumnStatus({
            id: columnId,
            selected: selected.value,
            transformable: transformable.value,
            name: name,
        });

        selectColumn({
            id: columnId,
            selectedColumn: {
                dataType: selectedColumn.value.dataType,
                name: selectedColumn.value.name,
                nameURI: selectedColumn.value.nameURI,
            },
        });
    } else {
        toast.add({
            title: 'Warning',
            description: 'The value of each column property must be unique.',
            color: 'orange',
        });
        setError('The value of each column property must be unique.');
    }
};

const isTransformable = (initialType, dataType) => {
    const initial = initialType.trim().toLowerCase();
    const transformsTo = dataType.trim().toLowerCase();
    const compatibility = dataTypeTransformCompatibility.value;

    // Transform all keys and values in compatibility to lowercase
    const normalizedCompatibility = Object.keys(compatibility).reduce((accumulator, key) => {
        accumulator[key.toLowerCase()] = new Set([...compatibility[key]].map((item) => item.toLowerCase()));
        return accumulator;
    }, {});

    if (initial in normalizedCompatibility) {
        return !!normalizedCompatibility[initial].has(transformsTo);
    }
    return false;
};

const reset = () => {
    selectedColumn.value = initialValue.value;
    const columnId = props.id;
    selected.value = true;
    transformable.value = true;
    search.value = initialValue.value;

    selectColumn({
        selectedColumn: selectedColumn.value,
        id: columnId,
    });

    if (props.column.name) {
        setColumnStatus({
            id: props.id,
            selected: true,
            transformable: transformable.value,
            name: props.column.name,
        });
    } else {
        setColumnStatus({
            id: props.id,
            selected: false,
            transformable: true,
            name: '',
        });
    }
};

const isUnique = (name) => {
    return !columnsStatus.value.some((column) => column.name.trim().toLowerCase() === name.trim().toLowerCase());
};

onMounted(() => {
    const matchingObject = columnsStatus.value.find((obj) => obj.id === props.id);

    if (matchingObject) {
        selected.value = matchingObject.selected;
        transformable.value = matchingObject.transformable;
    }

    if (props.column.name) {
        setColumnStatus({
            id: props.id,
            selected: true,
            transformable: transformable.value,
            name: props.column.name,
        });
    } else {
        setColumnStatus({
            id: props.id,
            selected: false,
            transformable: true,
            name: '',
        });
    }
});

// Expose methods
defineExpose({ reset });
</script>

<style scoped>
.table-header {
}
</style>
