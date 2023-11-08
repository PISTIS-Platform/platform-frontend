<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useIntlDates } from '../../composables/dates';
import { transactionsDummyData } from './transactions-dummy-data';

const { t } = useI18n();

//cards info data
const cardInfoData = computed(() => [
    {
        title: t('data.wallet.balance'),
        iconName: 'i-heroicons-currency-dollar-20-solid',
        amount: 3500,
    },
    {
        title: t('data.wallet.monthlyExpenses'),
        iconName: 'i-heroicons-briefcase-solid',
        amount: -1000,
    },
    {
        title: t('data.wallet.monthlyIncome'),
        iconName: 'i-heroicons-banknotes-20-solid',
        amount: 800,
    },
]);

//transactions data
const transactions = computed(() => transactionsDummyData);

const transactionsColumns: any = [
    {
        key: 'date',
        label: 'Date',
        sortable: true,
        direction: 'desc',
        class: 'w-1/5',
    },
    {
        key: 'fromTo',
        label: 'Buyer / Seller',
        sortable: true,
        class: 'w-1/4',
    },
    {
        key: 'type',
        label: 'Type',
        sortable: true,
        class: 'text-center w-1/5',
    },
    {
        key: 'amount',
        label: 'Amount',
        sortable: true,
        class: 'text-right w-1/5',
    },
    {
        key: 'id',
        label: 'ID',
        sortable: true,
        class: 'w-1/5',
    },
];
const page = ref<number>(1);
const pageCount = 5;

const transactionsRows = computed(() => {
    return transactions.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});
</script>
<template>
    <div class="w-full h-full">
        <h1 class="text-2xl">
            {{ $t('data.wallet.title') }}
        </h1>

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
                    <template #date-data="{ row }">
                        <span>{{ useIntlDates(row.date) }}</span>
                    </template>
                    <template #type-data="{ row }">
                        <div class="text-center">
                            <span
                                :class="[
                                    'rounded-md px-4 py-1 font-medium',
                                    row.type === 'Incoming' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                                ]"
                                >{{ row.type }}
                            </span>
                        </div>
                    </template>
                    <template #fromTo-data="{ row }">
                        <span>{{ row?.from ?? row.to }} </span>
                    </template>
                    <template #amount-data="{ row }">
                        <div class="text-right font-semibold">
                            <span>{{ row.amount }}</span>
                        </div>
                    </template>
                </UTable>

                <!-- Display the pagination only if the total number of transactions is larger than the page count -->
                <div v-if="transactions.length > pageCount" class="flex justify-end mt-2">
                    <UPagination
                        v-model="page"
                        :page-count="pageCount"
                        :total="transactions.length"
                        :active-button="{ variant: 'outline' }"
                    />
                </div>
            </UCard>
        </div>
    </div>
</template>
