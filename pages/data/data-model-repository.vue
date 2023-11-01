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
    // {
    //     key: 'country',
    //     label: t('data.dmRepository.tableFields.country'),
    //     sortable: true,
    // },
    {
        key: 'size',
        label: t('data.dmRepository.tableFields.size'),
    },
    {
        key: 'year',
        label: t('data.dmRepository.tableFields.year'),
        sortable: true,
    },
];

// Functionality to select items from table
function select(row: DataModelRepo) {
    const index = selected.value.findIndex((item: DataModelRepo) => item.id === row.id);
    if (index === -1) {
        selected.value.push(row as DataModelRepo);
    } else {
        selected.value.splice(index, 1);
    }
}
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

async function editRepo() {
    await navigateTo({
        path: '/data/add-data-model-repository',
        query: {
            data: JSON.stringify(selected.value),
        },
    });
    // console.log(selected.value);
}

function viewRepo() {
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
                <div class="order-first">
                    <UInput v-model="searchString" :placeholder="$t('data.dmRepository.search')" />
                </div>
                <div class="order-last flex gap-2">
                    <UTooltip :text="$t('data.dmRepository.view')">
                        <UIcon
                            name="i-heroicons-eye-20-solid"
                            color="gray"
                            class="h-6 w-6 cursor-pointer"
                            @click="viewRepo"
                        />
                    </UTooltip>
                    <UTooltip :text="$t('data.dmRepository.edit')">
                        <UIcon
                            name="i-heroicons-pencil-20-solid"
                            color="gray"
                            class="h-6 w-6 cursor-pointer"
                            @click="editRepo"
                        />
                    </UTooltip>
                    <UTooltip :text="$t('data.dmRepository.download')">
                        <UIcon
                            name="i-heroicons-arrow-down-20-solid"
                            color="gray"
                            class="h-6 w-6 cursor-pointer"
                            @click="downloadRepo"
                        />
                    </UTooltip>
                    <UTooltip :text="$t('data.dmRepository.delete')">
                        <UIcon
                            name="i-heroicons-trash-20-solid"
                            color="gray"
                            class="h-6 w-6 cursor-pointer"
                            @click="deleteRepo"
                        />
                    </UTooltip>
                    <UTooltip :text="$t('data.dmRepository.addDataset')">
                        <NuxtLink to="/data/add-data-model-repository">
                            <UIcon
                                name="i-heroicons-document-plus-20-solid"
                                color="gray"
                                class="h-6 w-6 cursor-pointer"
                            />
                        </NuxtLink>
                    </UTooltip>
                </div>
            </div>

            <UTable
                v-model="selected"
                class="mt-8"
                :columns="columns"
                :rows="filteredRows"
                :sort="{ column: 'id' }"
                :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No items.' }"
                @select="select"
            />
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
