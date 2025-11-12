<script setup lang="ts">
const { t } = useI18n();
import dayjs from 'dayjs';
import * as R from 'ramda';

const { data: session } = useAuth();

const currentBalance = ref();
const isLoadingWallet = ref(true);

await useLazyFetch(`/api/wallet`, {
    method: 'post',
    async onResponse({ response }) {
        currentBalance.value = response._data;
        isLoadingWallet.value = false;
    },
});

//cards info data
const cardInfoData = computed(() => [
    {
        title: t('transactions.monthlyIncome'),
        iconName: 'i-heroicons-banknotes-20-solid',
        amount: incoming.value.toFixed(2),
        textColor: 'text-green-800',
    },
    {
        title: t('transactions.monthlyExpenses'),
        iconName: 'i-heroicons-briefcase-solid',
        amount: outgoing.value.toFixed(2),
        textColor: 'text-red-800',
    },
    {
        title: t('data.wallet.balance'),
        iconName: 'i-heroicons-currency-dollar-20-solid',
        amount: !R.isNil(currentBalance.value?.dlt_amount) ? currentBalance.value?.dlt_amount.toFixed(2) : 'N/A',
        textColor: 'text-green-800',
    },
]);

const columns = [
    {
        key: 'createdAt',
        label: t('transactions.date'),
        sortable: true,
        class: 'text-center w-12',
    },
    {
        key: 'type',
        label: t('transactions.type'),
        class: 'text-center w-12',
    },
    {
        key: 'amount',
        label: t('transactions.amount'),
        sortable: true,
        class: 'text-center w-12 text-nowrap',
    },
    {
        key: 'assetName',
        label: t('transactions.assetName'),
        sortable: true,
        class: 'text-left',
    },
    {
        key: 'factorySellerName',
        label: t('transactions.provider'),
        sortable: true,
        class: 'text-center w-12',
    },
    {
        key: 'factoryBuyerName',
        label: t('transactions.consumer'),
        sortable: true,
        class: 'text-center w-12',
    },
];

const page = ref(1);

const data = computed(() => transactionsData.value.data);

const sortBy = ref({ column: 'createdAt', direction: 'desc' });

const sortByColumn = computed(() => sortBy.value.column);
const sortByDirection = computed(() => sortBy.value.direction);

const totalCount = computed(() => transactionsData.value.meta.totalItems);

const {
    data: transactionsData,
    status: transactionsStatus,
    error,
} = useFetch<any>(`/api/wallet/transactions`, {
    method: 'GET',
    query: {
        page,
        sortByColumn,
        sortByDirection,
    },
});

const {
    data: transactionsSumsData,
    status: transactionsSumsStatus,
    error: transactionsSumsError,
} = useFetch<any>(`/api/wallet/transactions-sums`, {
    method: 'GET',
});

const incoming = computed(() => transactionsSumsData.value?.incomeTotal || 0);
const outgoing = computed(() => transactionsSumsData.value?.expensesTotal || 0);
</script>

<template>
    <div class="justify-center items-center px-8 max-w-7xl mx-auto w-full pt-6">
        <ErrorCard
            v-if="error || transactionsSumsError"
            :error-msg="(error || transactionsSumsError)?.data?.data?.message"
            class="mt-6"
        />
        <PageContainer v-else>
            <div class="flex flex-col md:flex-row gap-6 w-full">
                <WalletCard
                    v-for="card in cardInfoData"
                    :key="card.title"
                    class="w-full md:w-1/3"
                    :title="card.title"
                    :amount="card.amount"
                    :icon-name="card.iconName"
                    :text-color="card.textColor"
                    :loading="isLoadingWallet || transactionsSumsStatus === 'pending'"
                />
            </div>
            <div v-if="transactionsStatus === 'pending'" class="flex flex-col w-full text-lg mt-6">
                <UProgress animation="carousel" color="primary" />
            </div>
            <div v-else class="w-full mt-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between w-full">
                            <span class="font-bold text-lg">{{ $t('transactions.title') }}</span>
                        </div>
                    </template>

                    <UTable
                        v-model:sort="sortBy"
                        sort-mode="manual"
                        :columns="columns"
                        :rows="data"
                        :empty-state="{
                            icon: 'i-heroicons-circle-stack-20-solid',
                            label: $t('data.wallet.noTransactions'),
                        }"
                    >
                        <template #createdAt-data="{ row }">
                            <span v-if="row.createdAt" class="flex items-center justify-center">{{
                                dayjs(row.createdAt).format('DD/MM/YYYY')
                            }}</span>
                            <span v-else>&mdash;</span>
                        </template>

                        <template #amount-data="{ row }">
                            <span class="flex items-center justify-center font-bold">
                                {{ row.amount.toFixed(2) }} EUR
                            </span>
                        </template>

                        <template #assetName-data="{ row }">
                            <span class="flex items-center justify-start">
                                <span>
                                    <a
                                        :href="`/marketplace/dataset-details/${row.assetId}?pm=cloud`"
                                        target="_blank"
                                        class="text-primary"
                                        >{{ row.assetName }}</a
                                    >
                                </span>
                            </span>
                        </template>

                        <template #factorySellerName-data="{ row }">
                            <UTooltip
                                :text="row.factorySellerName"
                                :ui="{ width: 'max-w-lg' }"
                                :popper="{ placement: 'top' }"
                                class="flex items-center justify-center"
                            >
                                <span class="flex items-center justify-start">
                                    {{ row.factorySellerName }}
                                </span>
                            </UTooltip>
                        </template>

                        <template #factoryBuyerName-data="{ row }">
                            <UTooltip
                                :text="row.factoryBuyerName"
                                :ui="{ width: 'max-w-lg' }"
                                :popper="{ placement: 'top' }"
                                class="flex items-center justify-center"
                            >
                                <span class="flex items-center justify-start">
                                    {{ row.factoryBuyerName }}
                                </span>
                            </UTooltip>
                        </template>

                        <template #type-data="{ row }">
                            <span class="flex justify-center">
                                <UBadge v-if="row.factoryBuyerId === session?.orgId" variant="subtle" color="red">{{
                                    $t('transactions.outgoing')
                                }}</UBadge>
                                <UBadge v-else variant="subtle" color="green">{{ $t('transactions.incoming') }}</UBadge>
                            </span>
                        </template>
                    </UTable>
                    <div class="flex justify-end mt-2">
                        <UPagination
                            v-if="data"
                            v-model="page"
                            :page-count="10"
                            :total="totalCount"
                            :active-button="{ variant: 'outline' }"
                        />
                    </div>
                </UCard>
            </div>
        </PageContainer>
    </div>
</template>

<style scoped>
::v-deep tr td:first-child {
    width: 50px !important;
}
</style>
