<script setup lang="ts">
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const transactions = await $fetch('/api/wallet/transactions-data', {
    method: 'post',
});
const isHovered = ref();

const incoming = transactions.incoming.map((item) => {
    return {
        date: item.included_at,
        id: item.transaction_id,
        amount: item.payload.Basic.amount,
        type: 'Incoming',
    };
});

const outgoing = transactions.outgoing.map((item) => {
    return {
        date: item.included_at,
        id: item.transaction_id,
        amount: item.payload.Basic.amount,
        type: 'Outgoing',
    };
});

const transactionsData = computed(() => [...incoming, ...outgoing]);

const { data: currentBalance } = await useLazyFetch(`/api/wallet`, {
    method: 'post',
});
//cards info data
const cardInfoData = computed(() => [
    {
        title: t('data.wallet.monthlyIncome'),
        iconName: 'i-heroicons-banknotes-20-solid',
        amount: incoming.reduce((sum, transaction) => {
            return sum + transaction.amount;
        }, 0),
        textColor: 'text-green-800',
    },

    {
        title: t('data.wallet.monthlyExpenses'),
        iconName: 'i-heroicons-briefcase-solid',
        amount: outgoing.reduce((sum, transaction) => {
            return sum + transaction.amount;
        }, 0),
        textColor: 'text-red-800',
    },
    {
        title: t('data.wallet.balance'),
        iconName: 'i-heroicons-currency-dollar-20-solid',
        amount: currentBalance.value?.dlt_amount || 'N/A',
        textColor: 'text-green-800',
    },
]);

const transactionsColumns: any = [
    {
        key: 'date',
        label: 'Date',
        sortable: true,
        direction: 'desc',
        class: 'w-1/5',
    },
    // {
    //     key: 'fromTo',
    //     label: 'Buyer / Seller',
    //     sortable: true,
    //     class: 'w-1/4',
    // },
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
        label: 'Transaction ID',
        sortable: true,
        class: 'w-1/5',
    },
];
const page = ref<number>(1);
const pageCount = 5;

const transactionsRows = computed(() => {
    return transactionsData.value
        ? transactionsData.value.slice((page.value - 1) * pageCount, page.value * pageCount)
        : [];
});
//TODO: Uncomment this in case we add more info in table
// const truncateId = (item: string, length: number) => {
//     return item.length > length ? item.slice(0, length) + '...' : item;
// };
</script>

<template>
    <PageContainer>
        <div class="w-full h-full">
            <!-- Cards Info -->
            <div class="flex flex-col md:flex-row gap-6 lg:gap-8 w-full mt-8">
                <WalletCard
                    v-for="card in cardInfoData"
                    :key="card.title"
                    class="w-full md:w-1/3"
                    :title="card.title"
                    :amount="card.amount"
                    :icon-name="card.iconName"
                    :text-color="card.textColor"
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
                            <span>{{ dayjs(row.date).format('DD/MM/YYYY') }}</span>
                        </template>
                        <template #type-data="{ row }">
                            <div class="text-center">
                                <span
                                    :class="[
                                        'rounded-md px-4 py-1 font-medium',
                                        row.type === 'Incoming'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800',
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
                                <span>{{ row.amount.toFixed(2) }}</span>
                            </div>
                        </template>
                        <template #id-data="{ row }">
                            <div @mouseover="isHovered = row.id" @mouseleave="isHovered = null">
                                <!-- <UTooltip arrow :text="row.id">
                                    {{ truncateId(row.id, 10) }}
                                </UTooltip> -->
                                {{ row.id }}
                            </div>
                        </template>
                    </UTable>
                    <!-- Display the pagination only if the total number of transactions is larger than the page count -->
                    <div v-if="transactionsData && transactionsData?.length > pageCount" class="flex justify-end mt-2">
                        <UPagination
                            v-model="page"
                            :page-count="pageCount"
                            :total="transactionsData?.length"
                            :active-button="{ variant: 'outline' }"
                        />
                    </div>
                </UCard>
            </div>
        </div>
    </PageContainer>
</template>
