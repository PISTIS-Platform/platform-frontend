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
    monetizationDetails: {
        type: Object,
        required: true,
    },
    queryPayloadProp: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits([
    'reset',
    'update:complete-or-query',
    'cancel',
    'update:data-selector-is-valid',
    'update:query-payload',
]);

const queryPayload = computed({
    get() {
        return props.queryPayloadProp;
    },
    set(newValue) {
        emit('update:query-payload', newValue);
    },
});

const assetOfferingDetails = computed(() => props.assetOfferingDetails);
const monetizationDetails = computed(() => props.monetizationDetails);

const dateRangeFormRef = ref();
const showColumnError = ref(false);
const columnSearch = ref('');
const truncationState = reactive<Record<string, boolean>>({});

const selectCompleteOrQuery = (value: string) => {
    if (value === DatasetKind.COMPLETE) {
        switchDatasetOpen.value = true;
    } else {
        emit('update:complete-or-query', value);
    }
};

const clearForms = () => {
    const newPayload = { ...queryPayload.value };
    newPayload.dateRange = {
        dateColumn: undefined,
        fromDate: undefined,
        toDate: undefined,
    };
    newPayload.selectedColumns = [];

    queryPayload.value = newPayload;
    showColumnError.value = false;
    columnSearch.value = '';
};

const reset = () => {
    switchDatasetOpen.value = false;
    clearForms();
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
        title: t('data.designer.completeDistribution'),
        info: t('data.designer.selectDistribution'),
        value: DatasetKind.COMPLETE,
    },
    {
        title: t('data.designer.queryFilter'),
        info: t('data.designer.selectQueryFilter'),
        value: DatasetKind.QUERY_FILTER,
        disabled:
            assetOfferingDetails.value.selectedDistribution?.format?.id !== 'SQL' ||
            monetizationDetails.value.type === 'nft',
    },
]);

watch(
    () => assetOfferingDetails.value,
    () => {
        if (
            assetOfferingDetails.value.selectedDistribution?.format?.id !== 'SQL' &&
            props.completeOrQuery === DatasetKind.QUERY_FILTER
        ) {
            reset();
        }
    },
    { deep: true },
);

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

// TODO: Get real ones from API
const columns = [
    {
        columnName: 'batteryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
        columnType: 'Integer',
    },
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

const filteredColumns = computed(() => {
    let result = [...columns];
    result.sort((a, b) => a.columnName.localeCompare(b.columnName));
    if (columnSearch.value) {
        const query = columnSearch.value.toLowerCase();
        result = result.filter(
            (col) => col.columnName.toLowerCase().includes(query) || col.columnType.toLowerCase().includes(query),
        );
    }
    return result;
});

const toggleColumn = (columnName: string) => {
    let currentColumns = [...(queryPayload.value.selectedColumns || [])];

    if (currentColumns.includes(columnName)) {
        currentColumns = currentColumns.filter((c) => c !== columnName);
    } else {
        currentColumns = [...currentColumns, columnName];
    }

    const newPayload = {
        ...queryPayload.value,
        selectedColumns: currentColumns,
    };
    queryPayload.value = newPayload;
};

const selectAllColumns = () => {
    const visibleNames = filteredColumns.value.map((c) => c.columnName);
    const currentSelected = queryPayload.value.selectedColumns || [];
    const newSelection = [...new Set([...currentSelected, ...visibleNames])];

    queryPayload.value = {
        ...queryPayload.value,
        selectedColumns: newSelection,
    };
};

const deselectAllColumns = () => {
    const visibleNames = filteredColumns.value.map((c) => c.columnName);
    const currentSelected = queryPayload.value.selectedColumns || [];

    const newSelection = currentSelected.filter((selectedName: string) => !visibleNames.includes(selectedName));

    queryPayload.value = {
        ...queryPayload.value,
        selectedColumns: newSelection,
    };
};

const invertColumnSelection = () => {
    const visibleNames = filteredColumns.value.map((c) => c.columnName);
    const currentSelected = queryPayload.value.selectedColumns || [];

    const hiddenSelected = currentSelected.filter((selectedName: string) => !visibleNames.includes(selectedName));
    const visibleSelected = currentSelected.filter((selectedName: string) => visibleNames.includes(selectedName));
    const visibleUnselected = visibleNames.filter((name) => !visibleSelected.includes(name));

    const newSelection = [...hiddenSelected, ...visibleUnselected];

    queryPayload.value = {
        ...queryPayload.value,
        selectedColumns: newSelection,
    };
};

const dateRangeSchema = computed(() => {
    const hasColumns = (queryPayload.value.selectedColumns || []).length > 0;

    if (!hasColumns) {
        return z.object({
            dateColumn: z.string({ required_error: t('required') }).min(1, t('required')),
            fromDate: z.date({ required_error: t('required') }),
            toDate: z.date({ required_error: t('required') }),
        });
    }

    return z
        .object({
            dateColumn: z.any().optional(),
            fromDate: z.any().optional(),
            toDate: z.any().optional(),
        })
        .superRefine((data, ctx) => {
            const hasValue = (val: any) => val !== undefined && val !== null && val !== '';

            const hasDateCol = hasValue(data.dateColumn);
            const hasFrom = hasValue(data.fromDate);
            const hasTo = hasValue(data.toDate);

            if (!hasDateCol && !hasFrom && !hasTo) {
                return;
            }

            if (!hasDateCol)
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('required'), path: ['dateColumn'] });
            if (!hasFrom) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('required'), path: ['fromDate'] });
            if (!hasTo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('required'), path: ['toDate'] });
        });
});

const isDataSelectorValid = computed(() => {
    if (props.completeOrQuery === DatasetKind.COMPLETE) {
        return true;
    }
    return dateRangeSchema.value.safeParse(queryPayload.value.dateRange).success;
});

const triggerValidation = async () => {
    const dateRange = queryPayload.value.dateRange;
    const isDateValid = dateRangeSchema.value.safeParse(dateRange).success;
    const hasColumns = (queryPayload.value.selectedColumns || []).length > 0;
    const hasPartialDateData = !!dateRange.dateColumn || !!dateRange.fromDate || !!dateRange.toDate;

    if (hasPartialDateData && !isDateValid) {
        selectedTab.value = 0;

        await nextTick();
        const formInstance = Array.isArray(dateRangeFormRef.value) ? dateRangeFormRef.value[0] : dateRangeFormRef.value;
        if (formInstance) {
            await formInstance.validate().catch(() => {});
        }
        return;
    }

    if (!hasColumns && !isDateValid) {
        if (selectedTab.value === 0) {
            const formInstance = Array.isArray(dateRangeFormRef.value)
                ? dateRangeFormRef.value[0]
                : dateRangeFormRef.value;
            if (formInstance) {
                await formInstance.validate().catch(() => {});
            }
        } else {
            showColumnError.value = true;
        }
        return;
    }

    showColumnError.value = false;
};

const checkTruncation = (event: Event, columnName: string) => {
    const target = event.target as HTMLElement;
    truncationState[columnName] = target.scrollWidth > target.clientWidth;
};

defineExpose({
    openSwitchWarning,
    triggerValidation,
    clearForms,
});

watch(
    [
        () => queryPayload.value.dateRange?.dateColumn,
        () => queryPayload.value.dateRange?.fromDate,
        () => queryPayload.value.dateRange?.toDate,
        () => queryPayload.value.selectedColumns,
    ],
    ([newCol, newFrom, newTo, newColumns], [oldCol, oldFrom, oldTo]) => {
        const formInstance = Array.isArray(dateRangeFormRef.value) ? dateRangeFormRef.value[0] : dateRangeFormRef.value;

        if (!formInstance) return;

        if (newCol !== oldCol) formInstance.clear('dateColumn');
        if (newFrom !== oldFrom) formInstance.clear('fromDate');
        if (newTo !== oldTo) formInstance.clear('toDate');

        if (newColumns && newColumns.length > 0) {
            showColumnError.value = false;
            if (
                !queryPayload.value.dateRange?.dateColumn &&
                !queryPayload.value.dateRange?.fromDate &&
                !queryPayload.value.dateRange?.toDate
            ) {
                formInstance.clear();
            }
        }

        const isDateValid = dateRangeSchema.value.safeParse(queryPayload.value.dateRange).success;
        if (isDateValid) showColumnError.value = false;
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
                    :title="$t('data.designer.distributionSelected')"
                    :info="$t('data.designer.distributionSelectedInfo')"
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
                                :state="queryPayload.dateRange"
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
                                        v-model="queryPayload.dateRange.dateColumn"
                                        :options="columns"
                                        :placeholder="$t('data.designer.query.dateRange.selectColumn')"
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
                                                queryPayload.dateRange.fromDate
                                                    ? dayjs(queryPayload.dateRange.fromDate).format('DD MMMM YYYY')
                                                    : $t('data.designer.query.dateRange.fromDate')
                                            "
                                            :class="[
                                                'min-w-40',
                                                !queryPayload.dateRange.fromDate && !error
                                                    ? 'text-gray-400 font-normal'
                                                    : '',
                                            ]"
                                        />
                                        <template #panel="{ close }">
                                            <DatePicker
                                                v-model="queryPayload.dateRange.fromDate"
                                                is-required
                                                @close="close"
                                            />
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
                                                queryPayload.dateRange.toDate
                                                    ? dayjs(queryPayload.dateRange.toDate).format('DD MMMM YYYY')
                                                    : $t('data.designer.query.dateRange.toDate')
                                            "
                                            :class="[
                                                'min-w-40',
                                                !queryPayload.dateRange.toDate && !error
                                                    ? 'text-gray-400 font-normal'
                                                    : '',
                                            ]"
                                        />
                                        <template #panel="{ close }">
                                            <DatePicker
                                                v-model="queryPayload.dateRange.toDate"
                                                is-required
                                                @close="close"
                                            />
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
                                        :placeholder="$t('search')"
                                        class="w-48"
                                    />
                                    <span class="text-xs text-gray-500 whitespace-nowrap">
                                        <span v-if="columnSearch"
                                            >{{
                                                (queryPayload.selectedColumns || []).filter((c) =>
                                                    filteredColumns.map((fc) => fc.columnName).includes(c),
                                                ).length
                                            }}
                                            / {{ filteredColumns.length }} {{ $t('visible') }}</span
                                        >
                                        <span v-else
                                            >{{ (queryPayload.selectedColumns || []).length }} / {{ columns.length }}
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
                                        (queryPayload.selectedColumns || []).includes(col.columnName)
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800',
                                    ]"
                                    @click="toggleColumn(col.columnName)"
                                >
                                    <div class="flex items-baseline gap-2 overflow-hidden flex-1 min-w-0">
                                        <UTooltip
                                            :text="col.columnName"
                                            :popper="{ placement: 'top' }"
                                            :prevent="!truncationState[col.columnName]"
                                            class="min-w-0"
                                            :ui="{ width: 'max-w-[300px]', base: 'whitespace-normal break-all h-auto' }"
                                        >
                                            <span
                                                class="font-medium truncate block"
                                                @mouseenter="checkTruncation($event, col.columnName)"
                                            >
                                                {{ col.columnName }}
                                            </span>
                                        </UTooltip>
                                        <span class="text-xs text-gray-500 font-mono flex-shrink-0"
                                            >({{ col.columnType }})</span
                                        >
                                    </div>

                                    <UCheckbox
                                        :model-value="(queryPayload.selectedColumns || []).includes(col.columnName)"
                                        :name="col.columnName"
                                        class="pointer-events-none ml-2 flex-shrink-0"
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
