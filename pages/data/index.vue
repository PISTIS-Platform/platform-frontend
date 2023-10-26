<script setup lang="ts">
import { transactionsDummyData } from './transactions-dummy-data';

//cards info data
const cardInfoData = computed(() => [
    {
        title: 'My Balance',
        iconName: 'i-heroicons-currency-dollar-20-solid',
        amount: '3500',
    },
    {
        title: 'Monthly Expenses',
        iconName: 'i-heroicons-briefcase-solid',
        amount: '-1000',
    },
    {
        title: 'Monthly Income',
        iconName: 'i-heroicons-banknotes-20-solid',
        amount: '+800',
    },
]);

//transactions data
const transactions = computed(() => transactionsDummyData);

enum TransactionStatus {
    INCOMING = 'Incoming',
    OUTGOING = 'Outgoing',
}

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
const pageCount = 10;

const transactionsRows = computed(() => {
    return transactions.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});
</script>
<template>
    <div class="w-full h-full text-gray-700">
        <Heading :title="$t('data.wallet')" />

        <!-- Cards Info -->
        <div class="flex flex-row gap-8 w-full mt-8">
            <WalletCard
                v-for="card in cardInfoData"
                :key="card.title"
                class="w-1/3"
                :title="card.title"
                :amount="card.amount"
                :icon-name="card.iconName"
            />
        </div>

        <Heading :title="$t('transactions.transactions')" class="mt-8" />

        <!-- Transactions -->
        <div class="flex flex-col w-full mt-8">
            <UTable :columns="transactionsColumns" :rows="transactionsRows">
                <!-- Custom styling for type data column -->
                <template #type-data="{ row }">
                    <span
                        :class="[
                            'rounded-lg px-2 py-1',
                            row.type === TransactionStatus.INCOMING
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800',
                        ]"
                        >{{ row.type }}
                    </span>
                </template>
            </UTable>

            <!-- Display the pagination only if the total number of transactions is larger than the page count -->
            <div v-if="transactions.length > pageCount" class="flex justify-end">
                <UPagination v-model="page" :page-count="pageCount" :total="transactions.length" />
            </div>
        </div>
    </div>
</template>
