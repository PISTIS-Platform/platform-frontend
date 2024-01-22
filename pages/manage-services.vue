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
const pageCount: number = 5;

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

const toggleActive = (_row: any) => {
    console.log('NYI - toggleActive');
};
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
                                :model-value="row.status === 'Live'"
                                :disabled="row.status === 'Deactivated'"
                                @click="toggleActive(row)"
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
