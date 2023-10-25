<script setup lang="ts">
import { dummyJson } from './dm-repo-dummy-data'; //We have to add actual data

// Fields for table
const columns = [
    {
        key: 'id',
        label: 'ID',
        sortable: true,
    },
    {
        key: 'first_name',
        label: 'Firstname',
        sortable: true,
    },
    {
        key: 'last_name',
        label: 'Lastname',
        sortable: true,
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
    },
    {
        key: 'gender',
        label: 'Gender',
        sortable: true,
        direction: 'desc',
    },
    {
        key: 'ip_address',
        label: 'IP Address',
    },
];

// Functionality to select items from table
function select(row: any) {
    const index = selected.value.findIndex((item: any) => item.id === row.id);
    if (index === -1) {
        selected.value.push(row);
    } else {
        selected.value.splice(index, 1);
    }
}
const selected = ref([]) as any;

// Pagination
const page = ref(1);
const pageCount = 5;
const rows = computed(() => {
    return dummyJson.slice((page.value - 1) * pageCount, page.value * pageCount);
});

// Searchable table
const searchString = ref('');
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

function editRepo() {
    console.log(selected.value);
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
        <Heading :title="$t('data.dmRepository.title')" />
        <div class="flex justify-between mt-8">
            <div class="order-first">
                <UInput v-model="searchString" placeholder="Filter data models" />
            </div>
            <div class="order-last">
                <UTooltip text="View">
                    <UButton icon="i-heroicons-eye-20-solid" color="gray" @click="viewRepo" />
                </UTooltip>
                <UTooltip text="Edit">
                    <UButton icon="i-heroicons-pencil-20-solid" color="gray" @click="editRepo" />
                </UTooltip>
                <UTooltip text="Download">
                    <UButton icon="i-heroicons-arrow-down-20-solid" color="gray" @click="downloadRepo" />
                </UTooltip>
                <UTooltip text="Delete">
                    <UButton icon="i-heroicons-trash-20-solid" color="gray" @click="deleteRepo" />
                </UTooltip>
            </div>
        </div>

        <UTable
            v-model="selected"
            class="mt-8"
            :columns="columns"
            :rows="filteredRows"
            :sort="{ column: 'title' }"
            :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No items.' }"
            @select="select"
        />
        <div class="flex justify-between mt-2">
            <div class="order-first">
                <UPagination v-model="page" :page-count="pageCount" :total="dummyJson.length" />
            </div>
            <div class="order-last">
                <UButton label="Add new dataset" to="/data/add-data-model-repository"></UButton>
            </div>
        </div>
    </div>
</template>
