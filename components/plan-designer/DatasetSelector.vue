<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import * as z from 'zod';

import { DatasetKind } from '~/interfaces/dataset.enum';

const { t } = useI18n();
import dayjs from 'dayjs';

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

const emit = defineEmits(['reset', 'update:complete-or-query', 'cancel']);

const selectCompleteOrQuery = (value: string) => {
    if (value === DatasetKind.COMPLETE) {
        switchDatasetOpen.value = true;
    } else {
        //TODO: API query for dataset info such as total rows, total columns, maybe date range
        emit('update:complete-or-query', value);
    }
};

const reset = () => {
    switchDatasetOpen.value = false;
    dateRangeState.dateColumn = undefined;
    dateRangeState.fromDate = undefined;
    dateRangeState.toDate = undefined;
    emit('reset');
};

const switchDatasetOpen = ref<boolean>(false);

const openSwitchWarning = () => {
    switchDatasetOpen.value = true;
};

defineExpose({
    openSwitchWarning,
});

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
        key: 'rowRange',
        label: t('data.designer.tab.rowRange.title'),
        icon: 'ic:round-table-rows',
        description: t('data.designer.tab.rowRange.description'),
    },
    {
        key: 'columnRange',
        label: t('data.designer.tab.columnRange.title'),
        icon: 'tabler:columns',
        description: t('data.designer.tab.columnRange.description'),
    },
    {
        key: 'selectColumns',
        label: t('data.designer.tab.selectColumns.title'),
        icon: 'qlementine-icons:select-all-16',
        description: t('data.designer.tab.selectColumns.description'),
    },
];

const selectedTab = ref(0);

const _formPayload = ref({
    dateRange: {
        dateColumn: null,
        fromDate: null,
        toDate: null,
    },
    rowRange: {
        fromRow: null,
        toRow: null,
    },
    columnRange: {
        fromColumn: null,
        toColumn: null,
    },
    selectColumns: [],
});

//TODO: Get real ones from API call
const columns = [
    'id',
    'timestamp',
    'sensor_id',
    'temperature',
    'humidity',
    'pressure',
    'location',
    'status',
    'battery',
    'signal',
    'errors',
    'notes',
];

const dateRangeState = reactive({
    dateColumn: undefined,
    fromDate: undefined,
    toDate: undefined,
});

const dateRangeSchema = z.object({
    dateColumn: z.string().min(0),
    fromDate: z.date(),
    toDate: z.date(),
});
</script>

<template>
    <!--//TODO: Make loading icon for when selecting query to get more data about the dataset distribution 
    
    //TODO: Make button to retrieve data preview data to show in a table underneath-->
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
                        <div v-show="item.key === 'dateRange'" class="flex items-center gap-4">
                            <UForm
                                :schema="dateRangeSchema"
                                :state="dateRangeState"
                                class="flex items-center gap-4 pb-4"
                            >
                                <UFormGroup
                                    :label="$t('data.designer.query.dateRange.dateColumn')"
                                    name="dateColumn"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                >
                                    <USelectMenu
                                        v-model="dateRangeState.dateColumn"
                                        :options="columns"
                                        class="min-w-64"
                                    />
                                </UFormGroup>
                                <UFormGroup
                                    v-slot="{ error }"
                                    :label="$t('data.designer.query.dateRange.fromDate')"
                                    name="fromDate"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                >
                                    <UPopover :popper="{ placement: 'bottom-start' }">
                                        <UButton
                                            color="white"
                                            icon="i-heroicons-calendar-days-20-solid"
                                            :label="
                                                dateRangeState.fromDate
                                                    ? dayjs(dateRangeState.fromDate).format('DD MMMM YYYY')
                                                    : $t('data.designer.query.dateRange.fromDate')
                                            "
                                            :class="[
                                                'min-w-40 hover:bg-white',
                                                error
                                                    ? 'ring-red-500'
                                                    : dateRangeState.fromDate
                                                      ? 'text-gray-700'
                                                      : 'text-gray-400 font-normal',
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
                                >
                                    <UPopover :popper="{ placement: 'bottom-start' }">
                                        <UButton
                                            color="white"
                                            icon="i-heroicons-calendar-days-20-solid"
                                            :label="
                                                dateRangeState.toDate
                                                    ? dayjs(dateRangeState.toDate).format('DD MMMM YYYY')
                                                    : $t('data.designer.query.dateRange.toDate')
                                            "
                                            :class="[
                                                'min-w-40 hover:bg-white',
                                                error
                                                    ? 'ring-red-500'
                                                    : dateRangeState.toDate
                                                      ? 'text-gray-700'
                                                      : 'text-gray-400 font-normal',
                                            ]"
                                        />
                                        <template #panel="{ close }">
                                            <DatePicker v-model="dateRangeState.toDate" is-required @close="close" />
                                        </template>
                                    </UPopover>
                                </UFormGroup>
                            </UForm>
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
