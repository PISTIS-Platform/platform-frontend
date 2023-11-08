<script setup lang="ts">
import { useI18n } from 'vue-i18n';

//We have to add actual data
import { useIntlDates } from '../../composables/dates';
import DataModelRepo from '../../interfaces/data-model-repo';
import { dummyJson } from './dm-repo-dummy-data';

const { t } = useI18n();

// Fields for table
//TODO: Discuss about column type
const columns = computed(() => [
    {
        key: 'id',
        label: t('data.dmRepository.tableFields.id'),
        sortable: true,
        direction: 'asc',
        class: 'w-1/12',
    },
    {
        key: 'title',
        label: t('data.dmRepository.tableFields.title'),
        sortable: true,
        direction: 'asc',
        class: 'w-1/3',
    },

    {
        key: 'version',
        sortable: false,
        label: t('data.dmRepository.tableFields.version'),
        class: 'w-1/6 text-slate-600 text-center',
    },
    {
        key: 'size',
        sortable: false,
        label: t('data.dmRepository.tableFields.size'),
        class: 'w-1/6 text-slate-600 text-right',
    },
    {
        key: 'year',
        label: t('data.dmRepository.tableFields.year'),
        sortable: true,
        direction: 'asc',
        class: 'w-1/6',
    },
    { key: 'actions', label: '', sortable: false, class: 'w-1/12 text-center' },
]);

const actions = (row: DataModelRepo[]) => [
    [
        {
            label: 'Edit',
            icon: 'i-heroicons-pencil-square-20-solid',
            click: () => editRepo(row),
        },
        {
            label: 'Download',
            icon: 'i-heroicons-arrow-down-tray-20-solid',
            click: () => downloadRepo(),
        },
    ],
    [
        {
            label: 'Delete',
            color: 'text-red-400',
            icon: 'i-heroicons-trash-20-solid text-red-400',
            class: 'text-red-400',
            click: () => deleteRepo(),
        },
    ],
];

const selected = ref<DataModelRepo[]>([]);

// Pagination
const page = ref<number>(1);
const pageCount = 5;
const rows = computed(() => {
    return dummyJson.slice((page.value - 1) * pageCount, page.value * pageCount);
});

// Searchable table
const searchString = ref<string>('');
const filteredRows = computed(() => {
    if (!searchString.value) {
        return rows.value;
    } else {
        return rows.value.filter((item) => {
            return Object.values(item).some((value) => {
                return String(value).toLowerCase().includes(searchString.value.toLowerCase());
            });
        });
    }
});

async function editRepo(row: DataModelRepo[]) {
    console.log(row);
    await navigateTo({
        path: '/data/add-data-model-repository',
        query: {
            data: JSON.stringify(selected.value),
        },
    });
}

function viewRepo(row: DataModelRepo[]) {
    selected.value = row;
    console.log(selected.value);
}

function downloadRepo() {
    console.log(selected.value);
}

function deleteRepo() {
    console.log(selected.value);
}
</script>

<template>
    <div class="w-full h-full text-gray-700">
        <h1 class="text-2xl">
            {{ $t('data.dmRepository.title') }}
        </h1>
        <UCard class="mt-8">
            <div class="flex justify-between flex-1">
                <div class="flex flex-1">
                    <UInput
                        v-model="searchString"
                        size="md"
                        :placeholder="$t('data.dmRepository.search')"
                        class="w-full"
                    />
                </div>
                <div class="ml-2 flex">
                    <UButton
                        icon="i-heroicons-document-plus"
                        size="md"
                        color="primary"
                        variant="solid"
                        to="/data/add-data-model-repository"
                        target="_self"
                        :label="$t('addNew')"
                        :trailing="false"
                    />
                </div>
            </div>
            <UTable
                class="mt-8"
                :columns="columns"
                :rows="filteredRows"
                :sort="{ column: 'id', direction: 'asc' }"
                :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No items.' }"
                @select="viewRepo"
            >
                <template #version-data="{ row }">
                    <div class="text-center">
                        <span>{{ row.size }}</span>
                    </div>
                </template>
                <template #size-data="{ row }">
                    <div class="text-right">
                        <span class="font-semibold">{{ row.size }}</span>
                    </div>
                </template>
                <template #year-data="{ row }">
                    <span>{{ useIntlDates(row.year) }}</span>
                </template>
                <template #actions-data="{ row }">
                    <UDropdown :items="actions(row)">
                        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-vertical-20-solid" />
                    </UDropdown>
                </template>
            </UTable>
            <div class="flex justify-end mt-2">
                <div class="mt-2">
                    <UPagination
                        v-model="page"
                        :page-count="pageCount"
                        :total="dummyJson.length"
                        :active-button="{ variant: 'outline' }"
                    />
                </div>
            </div>
        </UCard>
    </div>
</template>
