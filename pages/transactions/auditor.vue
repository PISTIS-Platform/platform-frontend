<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import { transactionData } from './transaction-auditor-data';

const { t } = useI18n();

const connectorsData = computed(() => transactionData);

const columns = [
    {
        key: 'id',
        label: t('transactions.tableFields.id'),
        direction: 'asc',
        class: 'w-1/12',
    },
    {
        key: 'buyer',
        label: t('transactions.tableFields.buyer'),
        sortable: true,
        direction: 'asc',
        class: 'w-1/3',
    },
    {
        key: 'seller',
        label: t('transactions.tableFields.seller'),
        sortable: true,
        direction: 'asc',
        class: 'w-1/3',
    },
    {
        key: 'transactionId',
        label: `${t('transactions.tableFields.transactionId')}`,
        class: 'w-1/6 text-slate-600 text-center',
    },
    {
        key: 'price',
        label: `${t('transactions.tableFields.price')}`,
        class: 'w-1/6 text-slate-600 text-center',
    },
    {
        key: 'date',
        label: `${t('transactions.tableFields.date')}`,
        sortable: true,
        class: 'w-1/3 text-slate-600 text-center',
    },
];

const page = ref<number>(1);
const pageCount: number = 5;

const rows = computed(() => {
    return connectorsData.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});
</script>

<template>
    <PageContainer>
        <div class="flex flex-col w-full">
            <UCard>
                <template #header>
                    <SubHeading :title="$t('transactions.auditor')" />
                </template>

                <UTable :columns="columns" :rows="rows" />

                <!-- Display the pagination only if the total number of transactions is larger than the page count -->
                <div v-if="connectorsData.length > pageCount" class="flex justify-end mt-2">
                    <UPagination v-model="page" :page-count="pageCount" :total="connectorsData.length" />
                </div>
            </UCard>
        </div>
    </PageContainer>
</template>
