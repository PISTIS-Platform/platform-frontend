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
        key: 'status',
        label: t('admin.services.factoryConnectors.status'),
        sortable: true,
    },
    {
        key: 'actions',
        label: `${t('admin.services.factoryConnectors.activate')} / ${t(
            'admin.services.factoryConnectors.deactivate',
        )}`,
    },
];

const page = ref(1);
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

const getActionButtonText = (status: string) => {
    if (status === t('admin.services.factoryConnectors.live')) {
        return t('admin.services.factoryConnectors.deactivate');
    }

    if (status === t('admin.services.factoryConnectors.deactivated')) {
        return t('admin.services.factoryConnectors.activate');
    }

    return '';
};

const getActionButtonColorClasses = (status: string) => {
    if (status === t('admin.services.factoryConnectors.live')) {
        return 'text-red-800 bg-red-200 hover:text-red-900 hover:bg-red-300';
    }

    if (status === t('admin.services.factoryConnectors.deactivated')) {
        return 'text-green-800 bg-green-200 hover:text-green-900 hover:bg-green-300';
    }

    return '';
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
                    <!-- Custom styling for status data column -->
                    <template #status-data="{ row }">
                        <span :class="getStatusColorClass(row.status)">{{ row.status }} </span>
                    </template>

                    <template #actions-data="{ row }">
                        <UButton
                            v-if="row.status !== $t('admin.services.factoryConnectors.pending')"
                            :class="[getActionButtonColorClasses(row.status), 'w-24 flex justify-center']"
                            >{{ getActionButtonText(row.status) }}
                        </UButton>
                        <div v-else></div>
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
