<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import DataModelRepo from '../../interfaces/data-model-repo';
import { dummyJson } from './dm-repo-dummy-data';
//We have to add actual data
const { t } = useI18n();

// Fields for table
const columns = [
    {
        key: 'id',
        label: t('data.dmRepository.tableFields.id'),
        sortable: true,
        direction: 'asc',
    },
    {
        key: 'title',
        label: t('data.dmRepository.tableFields.title'),
        sortable: true,
    },

    {
        key: 'version',
        label: t('data.dmRepository.tableFields.version'),
    },
    {
        key: 'size',
        label: t('data.dmRepository.tableFields.size'),
    },
    {
        key: 'year',
        label: t('data.dmRepository.tableFields.year'),
        sortable: true,
    },
    { key: 'actions' },
];

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
//TODO: discuss if multiple selection should be available
// Functionality to select items from table
// function select(row: DataModelRepo) {
//     const index = selected.value.findIndex((item: DataModelRepo) => item.id === row.id);
//     if (index === -1) {
//         selected.value.push(row as DataModelRepo);
//     } else {
//         selected.value.splice(index, 1);
//     }
// }
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
            <div class="flex justify-between mt-1">
                <div class="order-first w-3/4">
                    <UInput v-model="searchString" :placeholder="$t('data.dmRepository.search')" />
                </div>
                <div class="order-last flex gap-2">
                    <!-- TODO: Discuss if NuxtLink required for every link. Button has link property -->
                    <NuxtLink to="/data/add-data-model-repository">
                        <UButton
                            icon="i-heroicons-document-plus-20-solid"
                            size="sm"
                            color="primary"
                            variant="solid"
                            :label="$t('data.dmRepository.addDataModel')"
                            :trailing="false"
                        />
                    </NuxtLink>
                </div>
            </div>
            <UTable
                :ui="{ tr: { base: '[&>*:nth-child(3)]:text-center [&>*:nth-child(4)]:text-right ' } }"
                class="mt-8"
                :columns="columns"
                :rows="filteredRows"
                :sort="{ column: 'id', direction: 'asc' }"
                :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No items.' }"
                @select="viewRepo"
            >
                <template #actions-data="{ row }">
                    <UDropdown :items="actions(row)">
                        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
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
