<script setup lang="ts">
const R = useRamda();
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';

import type { SortOptions } from '~/interfaces/table';

const { t } = useI18n();
const incoming = ref([
    {
        date: '',
        id: '',
        amount: '',
        type: 'Incoming',
    },
]);
const outgoing = ref([
    {
        date: '',
        id: '',
        amount: '',
        type: 'Outgoing',
    },
]);

const sort = ref<SortOptions>({
    column: 'date',
    direction: 'desc',
});

const currentBalance = ref(null);

const monthlyIncome = ref(0);
const monthlyOutcome = ref(0);

const isHovered = ref();
const { status: balanceStatus } = await useLazyFetch(`/api/wallet`, {
    method: 'post',
    async onResponse({ response }) {
        currentBalance.value = response._data;
        await useLazyFetch('/api/wallet/transactions-data', {
            method: 'post',
            async onResponse({ response }) {
                const transactions = response._data;
                //FIXME: In the future we might show NFTs but not now
                incoming.value = transactions.incoming
                    .filter((item) => item.payload.Basic)
                    .map((item) => {
                        return {
                            date: item.included_at,
                            id: item.transaction_id,
                            amount: item.payload.Basic.amount,
                            type: 'Incoming',
                        };
                    });

                //FIXME: In the future we might show NFTs but not now
                outgoing.value = transactions.outgoing
                    .filter((item) => item.payload.Basic)
                    .map((item) => {
                        return {
                            date: item.included_at,
                            id: item.transaction_id,
                            amount: item.payload.Basic.amount,
                            type: 'Outgoing',
                        };
                    });
                monthlyIncome.value = incoming.value.reduce((sum, transaction) => {
                    return sum + transaction.amount;
                }, 0);
                monthlyOutcome.value = outgoing.value.reduce((sum, transaction) => {
                    return sum + transaction.amount;
                }, 0);
            },
        });
    },
});

const transactionsData = computed(() => [...outgoing.value, ...incoming.value]);

//cards info data
const cardInfoData = computed(() => [
    {
        title: t('data.wallet.monthlyIncome'),
        iconName: 'i-heroicons-banknotes-20-solid',
        amount: monthlyIncome.value.toFixed(2),
        textColor: 'text-green-800',
    },

    {
        title: t('data.wallet.monthlyExpenses'),
        iconName: 'i-heroicons-briefcase-solid',
        amount: monthlyOutcome.value.toFixed(2),
        textColor: 'text-red-800',
    },
    {
        title: t('data.wallet.balance'),
        iconName: 'i-heroicons-currency-dollar-20-solid',
        amount: !R.isNil(currentBalance.value?.dlt_amount) ? currentBalance.value?.dlt_amount.toFixed(2) : 'N/A',
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
        label: 'Amount(EUR)',
        sortable: true,
        class: 'text-center w-1/5',
    },
    {
        key: 'id',
        label: 'Transaction ID',
        sortable: true,
        class: 'w-1/5',
    },
];
const pageCount = 10;

const { page, paginatedRows, sortBy } = useTable(transactionsData, pageCount, sort);

// const fixedAmount = (item: number) => {
//     return item.toFixed(2);
// };
//TODO: Uncomment this in case we add more info in table
// const truncateId = (item: string, length: number) => {
//     return item.length > length ? item.slice(0, length) + '...' : item;
// };
</script>

<template>
    <PageContainer>
        <div class="w-full h-full">
            <!-- Cards Info -->
            <div v-if="balanceStatus === 'pending'" class="flex w-full gap-4 mt-8">
                <USkeleton
                    v-for="item in new Array(3)"
                    :key="item"
                    :ui="{ background: 'bg-gray-200' }"
                    class="h-[84px] w-full"
                />
            </div>
            <div v-else class="flex flex-col md:flex-row gap-6 lg:gap-8 w-full mt-8">
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
                <USkeleton
                    v-if="balanceStatus === 'pending'"
                    :ui="{ background: 'bg-gray-200' }"
                    class="w-full h-96 mb-8"
                />
                <UCard v-else class="mb-8">
                    <template #header>
                        <SubHeading :title="$t('data.wallet.transactions.title')" />
                    </template>
                    <UTable v-model:sort="sortBy" :columns="transactionsColumns" :rows="paginatedRows">
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
                            <div class="text-center font-semibold">
                                <span>{{ !R.isNil(row?.amount) ? row.amount.toFixed(2) : 'N/A' }}</span>
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
