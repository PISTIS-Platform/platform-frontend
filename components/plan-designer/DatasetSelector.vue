<script setup lang="ts">
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import * as z from 'zod';

import { DatasetKind } from '~/interfaces/dataset.enum';

const { t } = useI18n();

const props = defineProps({
    selected: {
        type: Object as PropType<{ id: number | string; title: string; description: string }>,
        required: true,
    },
    completeOrQuery: {
        type: String,
        required: true,
    },
    assetOfferingDetails: {
        type: Object,
        required: true,
    },
});

const assetOfferingDetails = computed(() => props.assetOfferingDetails);

const emit = defineEmits(['reset', 'update:complete-or-query', 'cancel', 'update:data-selector-is-valid']);

const dateRangeFormRef = ref();
const showColumnError = ref(false);
const columnSearch = ref('');

const selectCompleteOrQuery = (value: string) => {
    if (value === DatasetKind.COMPLETE) {
        switchDatasetOpen.value = true;
    } else {
        emit('update:complete-or-query', value);
    }
};

const reset = () => {
    switchDatasetOpen.value = false;
    dateRangeState.dateColumn = undefined;
    dateRangeState.fromDate = undefined;
    dateRangeState.toDate = undefined;
    selectedColumns.value = [];
    showColumnError.value = false;
    columnSearch.value = '';
    emit('reset');
};

const switchDatasetOpen = ref<boolean>(false);

const openSwitchWarning = () => {
    switchDatasetOpen.value = true;
};

const handleCancel = () => {
    switchDatasetOpen.value = false;
    emit('cancel');
};

const dataSetSelections = computed(() => [
    {
        title: t('data.designer.completeDataset'),
        info: t('data.designer.selectDataset'),
        value: DatasetKind.COMPLETE,
    },
    {
        title: t('data.designer.queryFilter'),
        info: t('data.designer.selectQueryFilter'),
        value: DatasetKind.QUERY_FILTER,
        disabled: assetOfferingDetails.value.selectedDistribution.format.id !== 'SQL',
    },
]);

watch(assetOfferingDetails.value, () => {
    if (
        assetOfferingDetails.value.selectedDistribution.format.id !== 'SQL' &&
        props.completeOrQuery === DatasetKind.QUERY_FILTER
    ) {
        reset();
    }
});

const tabItems = [
    {
        key: 'dateRange',
        label: t('data.designer.tab.dateRange.title'),
        icon: 'proicons:calendar',
        description: t('data.designer.tab.dateRange.description'),
    },
    {
        key: 'selectColumns',
        label: t('data.designer.tab.selectColumns.title'),
        icon: 'qlementine-icons:select-all-16',
        description: t('data.designer.tab.selectColumns.description'),
    },
];

const selectedTab = ref(0);

//TODO: Get real ones from API
const columns = [
    { columnName: 'battery', columnType: 'Integer' },
    { columnName: 'errors', columnType: 'String' },
    { columnName: 'humidity', columnType: 'Float' },
    { columnName: 'id', columnType: 'String' },
    { columnName: 'location', columnType: 'String' },
    { columnName: 'notes', columnType: 'Text' },
    { columnName: 'pressure', columnType: 'Float' },
    { columnName: 'sensor_id', columnType: 'String' },
    { columnName: 'signal', columnType: 'Integer' },
    { columnName: 'status', columnType: 'String' },
    { columnName: 'temperature', columnType: 'Float' },
    { columnName: 'timestamp', columnType: 'DateTime' },
];

// Computed property for filtered and sorted columns
const filteredColumns = computed(() => {
    let result = [...columns];

    // 1. Sort alphabetically
    result.sort((a, b) => a.columnName.localeCompare(b.columnName));

    // 2. Filter by search
    if (columnSearch.value) {
        const query = columnSearch.value.toLowerCase();
        result = result.filter(
            (col) => col.columnName.toLowerCase().includes(query) || col.columnType.toLowerCase().includes(query),
        );
    }

    return result;
});

const selectedColumns = ref<string[]>([]);

const toggleColumn = (columnName: string) => {
    const index = selectedColumns.value.indexOf(columnName);
    if (index > -1) {
        selectedColumns.value = selectedColumns.value.filter((c) => c !== columnName);
    } else {
        selectedColumns.value = [...selectedColumns.value, columnName];
    }
};

const selectAllColumns = () => {
    // only select visible columns to respect current filter
    const visibleNames = filteredColumns.value.map((c) => c.columnName);
    // combine existing unique selection with new visible ones
    selectedColumns.value = [...new Set([...selectedColumns.value, ...visibleNames])];
};

const deselectAllColumns = () => {
    // only deselect visible columns
    const visibleNames = filteredColumns.value.map((c) => c.columnName);

    // keep items that are not currently visible
    selectedColumns.value = selectedColumns.value.filter((selectedName) => !visibleNames.includes(selectedName));
};

const invertColumnSelection = () => {
    const visibleNames = filteredColumns.value.map((c) => c.columnName);

    // start with items that are selected but currently hidden (keep them safe)
    const hiddenSelected = selectedColumns.value.filter((selectedName) => !visibleNames.includes(selectedName));

    // calculate the inverted state for visible items
    const visibleSelected = selectedColumns.value.filter((selectedName) => visibleNames.includes(selectedName));

    // find visible items that were NOT selected (these should now become selected)
    const visibleUnselected = visibleNames.filter((name) => !visibleSelected.includes(name));

    // combine: hidden (keep) and visible (new)
    selectedColumns.value = [...hiddenSelected, ...visibleUnselected];
};

const dateRangeState = reactive({
    dateColumn: undefined,
    fromDate: undefined,
    toDate: undefined,
});

const dateRangeSchema = z.object({
    dateColumn: z.string({ required_error: t('required') }).min(1, t('required')),
    fromDate: z.date({ required_error: t('required') }),
    toDate: z.date({ required_error: t('required') }),
});

const isDataSelectorValid = computed(() => {
    if (props.completeOrQuery === DatasetKind.COMPLETE) {
        return true;
    }

    const activeTabKey = tabItems[selectedTab.value]?.key;

    if (activeTabKey === 'dateRange') {
        return dateRangeSchema.safeParse(dateRangeState).success;
    }

    if (activeTabKey === 'selectColumns') {
        return selectedColumns.value.length > 0;
    }

    return false;
});

const triggerValidation = async () => {
    const activeTabKey = tabItems[selectedTab.value]?.key;

    if (activeTabKey === 'dateRange') {
        const formInstance = Array.isArray(dateRangeFormRef.value) ? dateRangeFormRef.value[0] : dateRangeFormRef.value;

        if (formInstance) {
            await formInstance.validate().catch(() => {});
        }
    } else if (activeTabKey === 'selectColumns') {
        showColumnError.value = selectedColumns.value.length === 0;
    }
};

defineExpose({
    openSwitchWarning,
    triggerValidation,
});

watch(
    selectedColumns,
    (newVal) => {
        if (newVal.length > 0) showColumnError.value = false;
    },
    { deep: true },
);

watch(
    [() => dateRangeState.dateColumn, () => dateRangeState.fromDate, () => dateRangeState.toDate],
    ([newCol, newFrom, newTo], [oldCol, oldFrom, oldTo]) => {
        const formInstance = Array.isArray(dateRangeFormRef.value) ? dateRangeFormRef.value[0] : dateRangeFormRef.value;

        if (!formInstance) return;

        if (newCol !== oldCol) formInstance.clear('dateColumn');
        if (newFrom !== oldFrom) formInstance.clear('fromDate');
        if (newTo !== oldTo) formInstance.clear('toDate');
    },
);

watch(
    isDataSelectorValid,
    (newValue) => {
        emit('update:data-selector-is-valid', newValue);
    },
    { immediate: true },
);
</script>

<template>
    <UCard class="overflow-visible">
        <template #header>
            <div class="flex items-center gap-8">
                <UIcon name="lsicon:data-filled" class="w-10 h-10 text-gray-500 -mr-4" />
                <SubHeading
                    :title="$t('data.designer.datasetSelected')"
                    :info="$t('data.designer.datasetSelectedInfo')"
                />
            </div>
        </template>
        <div class="space-y-5">
            <div>
                <div v-if="selected.id" class="space-y-5">
                    <div class="flex gap-4 w-full">
                        <div class="flex flex-col items-start justify-start gap-4 whitespace-nowrap">
                            <p>{{ $t('data.designer.assetTitle') }}:</p>
                            <p>{{ $t('data.designer.assetDescription') }}:</p>
                        </div>
                        <div class="flex flex-col items-start justify-start gap-4">
                            <p class="font-bold">{{ selected.title }}</p>
                            <p>{{ selected.description }}</p>
                        </div>
                    </div>
                    <SelectionCards
                        :model-value="completeOrQuery"
                        class="gap-4"
                        :selections="dataSetSelections"
                        @update:model-value="(value: string) => selectCompleteOrQuery(value)"
                    />
                </div>
            </div>
        </div>
        <div v-show="completeOrQuery === DatasetKind.QUERY_FILTER" class="mt-6 text-sm">
            <UTabs v-model="selectedTab" :items="tabItems" class="w-full">
                <template #item="{ item }">
                    <div class="bg-gray-50 border rounded-lg p-4 flex flex-col gap-4 mt-2">
                        <div class="flex flex-col gap-2">
                            <span class="flex items-center gap-2 font-semibold">
                                <UIcon :name="item.icon" class="w-4 h-4" />
                                <span>Filter by {{ item.label }}</span>
                            </span>
                            <span class="text-xs text-gray-500">
                                {{ item.description }}
                            </span>
                        </div>

                        <div v-if="item.key === 'dateRange'" class="flex items-center gap-4">
                            <UForm
                                ref="dateRangeFormRef"
                                :schema="dateRangeSchema"
                                :state="dateRangeState"
                                class="flex items-center gap-4 pb-4"
                            >
                                <UFormGroup
                                    v-slot="{ error }"
                                    :label="$t('data.designer.query.dateRange.dateColumn')"
                                    name="dateColumn"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    required
                                    eager-validation
                                >
                                    <USelectMenu
                                        v-model="dateRangeState.dateColumn"
                                        :options="columns"
                                        value-attribute="columnName"
                                        option-attribute="columnName"
                                        class="min-w-64"
                                        :color="error ? 'red' : 'white'"
                                    />
                                </UFormGroup>
                                <UFormGroup
                                    v-slot="{ error }"
                                    :label="$t('data.designer.query.dateRange.fromDate')"
                                    name="fromDate"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    required
                                    eager-validation
                                >
                                    <UPopover :popper="{ placement: 'bottom-start' }">
                                        <UButton
                                            variant="outline"
                                            :color="error ? 'red' : 'white'"
                                            :icon="
                                                error
                                                    ? 'i-heroicons-exclamation-circle-20-solid'
                                                    : 'i-heroicons-calendar-days-20-solid'
                                            "
                                            :label="
                                                dateRangeState.fromDate
                                                    ? dayjs(dateRangeState.fromDate).format('DD MMMM YYYY')
                                                    : $t('data.designer.query.dateRange.fromDate')
                                            "
                                            :class="[
                                                'min-w-40',
                                                !dateRangeState.fromDate && !error ? 'text-gray-400 font-normal' : '',
                                            ]"
                                        />
                                        <template #panel="{ close }">
                                            <DatePicker v-model="dateRangeState.fromDate" is-required @close="close" />
                                        </template>
                                    </UPopover>
                                </UFormGroup>
                                <span class="mt-5">{{ $t('data.designer.query.dateRange.to') }}</span>
                                <UFormGroup
                                    v-slot="{ error }"
                                    :label="$t('data.designer.query.dateRange.toDate')"
                                    name="toDate"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    required
                                    eager-validation
                                >
                                    <UPopover :popper="{ placement: 'bottom-start' }">
                                        <UButton
                                            variant="outline"
                                            :color="error ? 'red' : 'white'"
                                            :icon="
                                                error
                                                    ? 'i-heroicons-exclamation-circle-20-solid'
                                                    : 'i-heroicons-calendar-days-20-solid'
                                            "
                                            :label="
                                                dateRangeState.toDate
                                                    ? dayjs(dateRangeState.toDate).format('DD MMMM YYYY')
                                                    : $t('data.designer.query.dateRange.toDate')
                                            "
                                            :class="[
                                                'min-w-40',
                                                !dateRangeState.toDate && !error ? 'text-gray-400 font-normal' : '',
                                            ]"
                                        />
                                        <template #panel="{ close }">
                                            <DatePicker v-model="dateRangeState.toDate" is-required @close="close" />
                                        </template>
                                    </UPopover>
                                </UFormGroup>
                            </UForm>
                        </div>

                        <div v-if="item.key === 'selectColumns'" class="flex flex-col gap-4">
                            <div
                                class="flex items-center justify-between border-b border-gray-200 pb-3 gap-4 flex-wrap"
                            >
                                <div class="flex items-center gap-2">
                                    <UButton size="xs" color="gray" variant="soft" @click="selectAllColumns">
                                        {{ $t('data.designer.selectAll') }}
                                    </UButton>
                                    <UButton size="xs" color="gray" variant="soft" @click="deselectAllColumns">
                                        {{ $t('data.designer.deselectAll') }}
                                    </UButton>
                                    <UButton
                                        size="xs"
                                        color="gray"
                                        variant="ghost"
                                        icon="i-heroicons-arrows-right-left"
                                        @click="invertColumnSelection"
                                    >
                                        {{ $t('data.designer.invertSelection') }}
                                    </UButton>
                                </div>

                                <div class="flex items-center gap-4">
                                    <UInput
                                        v-model="columnSearch"
                                        icon="i-heroicons-magnifying-glass-20-solid"
                                        size="xs"
                                        color="white"
                                        :trailing="false"
                                        :placeholder="$t('search') + '...'"
                                        class="w-48"
                                    />
                                    <span class="text-xs text-gray-500 whitespace-nowrap">
                                        <span v-if="columnSearch"
                                            >{{
                                                selectedColumns.filter((c) =>
                                                    filteredColumns.map((fc) => fc.columnName).includes(c),
                                                ).length
                                            }}
                                            / {{ filteredColumns.length }} {{ $t('visible') }}</span
                                        >
                                        <span v-else
                                            >{{ selectedColumns.length }} / {{ columns.length }}
                                            {{ $t('selected') }}</span
                                        >
                                    </span>
                                </div>
                            </div>

                            <div
                                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 min-h-[200px] p-2 rounded-lg transition-all max-h-[400px] overflow-y-auto"
                                :class="showColumnError ? 'ring-1 ring-red-500 bg-red-50 dark:bg-red-900/10' : ''"
                            >
                                <div
                                    v-for="col in filteredColumns"
                                    :key="col.columnName"
                                    :class="[
                                        'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors duration-200 h-12',
                                        selectedColumns.includes(col.columnName)
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800',
                                    ]"
                                    @click="toggleColumn(col.columnName)"
                                >
                                    <div class="flex items-baseline gap-2 overflow-hidden">
                                        <span class="font-medium truncate" :title="col.columnName">{{
                                            col.columnName
                                        }}</span>
                                        <span class="text-xs text-gray-500 font-mono">({{ col.columnType }})</span>
                                    </div>

                                    <UCheckbox
                                        :model-value="selectedColumns.includes(col.columnName)"
                                        :name="col.columnName"
                                        class="pointer-events-none ml-2"
                                    />
                                </div>

                                <div
                                    v-if="filteredColumns.length === 0"
                                    class="col-span-full text-center text-gray-500 py-8 italic"
                                >
                                    {{ $t('noResultsFound') }}
                                </div>
                            </div>
                            <span v-if="showColumnError" class="text-red-500 text-xs mt-1">
                                {{ $t('required') }}
                            </span>
                        </div>
                    </div>
                </template>
            </UTabs>
        </div>
    </UCard>
    <UModal v-model="switchDatasetOpen">
        <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
            <p class="font-bold text-xl">{{ $t('data.designer.areYouSure') }}</p>
            <p class="text-gray-400 mt-6">{{ $t('data.designer.willReset') }}</p>
            <div class="flex gap-8 w-full justify-center mt-6">
                <UButton color="white" class="w-20 flex justify-center" @click="handleCancel">{{
                    $t('cancel')
                }}</UButton>
                <UButton class="w-20 flex justify-center" @click="reset">{{ $t('yes') }}</UButton>
            </div>
        </UCard>
    </UModal>
</template>
