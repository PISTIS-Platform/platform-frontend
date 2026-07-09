<script setup lang="ts">
import type { MarketInsightLatestTransaction } from '~/interfaces/market-insight-latest-transaction';

const { t } = useI18n();

const { data, error } = await useLazyFetch<MarketInsightLatestTransaction[]>(
    '/api/market-insights/latest-transactions',
);

const pageCount = 5;
const rows = computed(() => data.value ?? []);
const { page, sortBy, filteredRows, paginatedRows } = useTable<MarketInsightLatestTransaction>(rows, pageCount);

const columns = [
    { key: 'assetName', label: t('market.overview.assetName'), sortable: true, class: 'w-1/3' },
    { key: 'factoryBuyerName', label: t('market.overview.buyer'), sortable: true },
    { key: 'factorySellerName', label: t('market.overview.seller'), sortable: true },
    { key: 'createdAt', label: t('market.overview.transactionDate'), sortable: true },
    { key: 'amount', label: t('market.overview.price'), sortable: true },
];

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-GB');
</script>

<template>
    <MarketInsightError v-if="error" />
    <UCard v-else class="w-full">
        <div class="flex flex-col gap-4">
            <p class="font-semibold">{{ t('market.overview.latestTransactions') }}</p>

            <UTable v-model:sort="sortBy" :columns="columns" :rows="paginatedRows" sort-mode="manual">
                <template #createdAt-data="{ row }">{{ formatDate(row.createdAt) }}</template>
                <template #amount-data="{ row }">{{ row.amount.toFixed(2) }}</template>
            </UTable>

            <UPagination
                v-if="filteredRows.length > pageCount"
                v-model="page"
                :page-count="pageCount"
                :total="filteredRows.length"
                :active-button="{ variant: 'outline' }"
            />
        </div>
    </UCard>
</template>
