<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { transactionsDummyData } from './transactions-dummy-data';

const { t } = useI18n();

//cards info data
const cardInfoData = computed(() => [
    {
        title: t('data.wallet.balance'),
        iconName: 'i-heroicons-currency-dollar-20-solid',
        amount: '3500',
    },
    {
        title: t('data.wallet.monthlyExpenses'),
        iconName: 'i-heroicons-briefcase-solid',
        amount: '-1000',
    },
    {
        title: t('data.wallet.monthlyIncome'),
        iconName: 'i-heroicons-banknotes-20-solid',
        amount: '+800',
    },
]);

//transactions data
const transactions = computed(() => transactionsDummyData);

const transactionsColumns = [
    {
        key: 'id',
        label: 'ID',
        sortable: true,
    },
    {
        key: 'date',
        label: 'Date',
        sortable: true,
        direction: 'desc',
    },
    {
        key: 'type',
        label: 'Type',
        sortable: true,
    },
    {
        key: 'amount',
        label: 'Amount',
        sortable: true,
    },
    {
        key: 'from',
        label: 'Buyer',
        sortable: true,
    },
    {
        key: 'to',
        label: 'Seller',
        sortable: true,
    },
];
const page = ref(1);
const pageCount = 5;

const transactionsRows = computed(() => {
    return transactions.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});
</script>
<template>
    <div class="w-full h-full text-gray-700">
        <Heading :title="$t('data.wallet.title')" />

        <!-- Cards Info -->
        <div class="flex flex-col md:flex-row gap-6 lg:gap-8 w-full mt-8">
            <WalletCard
                v-for="card in cardInfoData"
                :key="card.title"
                class="w-full md:w-1/3"
                :title="card.title"
                :amount="card.amount"
                :icon-name="card.iconName"
            />
        </div>

        <!-- Transactions -->
        <div class="flex flex-col w-full mt-8">
            <UCard>
                <template #header>
                    <SubHeading :title="$t('data.wallet.transactions.title')" />
                </template>

                <UTable :columns="transactionsColumns" :rows="transactionsRows">
                    <!-- Custom styling for type (incoming/outgoing) data column -->
                    <template #type-data="{ row }">
                        <span
                            :class="[
                                'rounded-lg px-2 py-1',
                                row.type === t('data.wallet.transactions.incoming')
                                    ? 'bg-green-200 text-green-800'
                                    : 'bg-red-200 text-red-800',
                            ]"
                            >{{ row.type }}
                        </span>
                    </template>
                </UTable>

                <!-- Display the pagination only if the total number of transactions is larger than the page count -->
                <div v-if="transactions.length > pageCount" class="flex justify-end mt-2">
                    <UPagination v-model="page" :page-count="pageCount" :total="transactions.length" />
                </div>
            </UCard>
        </div>
    </div>
</template>
