<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import { connectorsDummyData } from './connectors-dummy-data';

const { t } = useI18n();

const connectorsData = computed(() => connectorsDummyData);

const columns = [
    {
        key: 'name',
        label: t('admin.services.factoryConnectors.name'),
        sortable: true,
    },
    {
        key: 'ip',
        label: t('admin.services.factoryConnectors.ip'),
        sortable: true,
    },
    {
        key: 'country',
        label: t('admin.services.factoryConnectors.country'),
        sortable: true,
    },
    {
        key: 'actions',
        label: `${t('admin.services.factoryConnectors.activate')} / ${t(
            'admin.services.factoryConnectors.deactivate',
        )}`,
        class: 'text-center',
    },
];

const page = ref<number>(1);
const pageCount = 5;

const rows = computed(() => {
    return connectorsData.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});

const getStatusColorClass = (status: string) => {
    return {
        'text-green-500': status === t('admin.services.factoryConnectors.live'),
        'text-red-500': status === t('admin.services.factoryConnectors.deactivated'),
        'text-yellow-500': status === t('admin.services.factoryConnectors.pending'),
    };
};

const toggleActive = () => {
    console.log('Toggle clicked');
};

//TODO: Discuss if needed
// const getActionButtonColorClasses = (status: string) => {
//     if (status === t('admin.services.factoryConnectors.deactivated')) {
//         return 'text-red-600 bg-red-600 hover:text-red-600 hover:bg-red-600';
//     }

//     if (status === t('admin.services.factoryConnectors.live')) {
//         return 'text-green-600 bg-green-600 hover:text-green-700 hover:bg-green-700';
//     }

//     return '';
// };
</script>

<template>
    <PageContainer>
        <!-- Factory Connectors -->
        <div class="flex flex-col w-full mt-8">
            <UCard>
                <template #header>
                    <SubHeading :title="$t('admin.services.factoryConnectors.title')" />
                </template>

                <UTable :columns="columns" :rows="rows">
                    <!-- Custom styling for ip data column -->
                    <template #ip-data="{ row }">
                        <span class="flex items-center"
                            ><UIcon
                                name="i-heroicons-light-bulb-solid"
                                :class="[getStatusColorClass(row.status), 'mr-2']"
                            />{{ row.ip }}</span
                        >
                    </template>
                    <template #actions-data="{ row }">
                        <div class="justify-center flex">
                            <UToggle
                                :model-value="row.status === $t('admin.services.factoryConnectors.live')"
                                :disabled="row.status === $t('admin.services.factoryConnectors.pending')"
                                :ui="{ inactive: 'bg-red-600 dark:bg-red-700 disabled:bg-yellow-500' }"
                                color="green"
                                @click="toggleActive"
                            />
                        </div>
                    </template>
                </UTable>

                <!-- Display the pagination only if the total number of transactions is larger than the page count -->
                <div v-if="connectorsData.length > pageCount" class="flex justify-end mt-2">
                    <UPagination v-model="page" :page-count="pageCount" :total="connectorsData.length" />
                </div>
            </UCard>
        </div>
    </PageContainer>
</template>
