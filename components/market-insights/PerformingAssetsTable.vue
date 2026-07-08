<script setup lang="ts">
import type { MarketInsightAssetPerformance } from '~/interfaces/market-insight-performing-assets';

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    assets: {
        type: Array as PropType<MarketInsightAssetPerformance[]>,
        required: true,
    },
});

const { t } = useI18n();

const pageCount = 5;
const rows = computed(() => props.assets);
const { page, sortBy, filteredRows, paginatedRows } = useTable<MarketInsightAssetPerformance>(rows, pageCount);

const columns = [
    { key: 'assetName', label: t('market.overview.assetName'), sortable: true, class: 'w-1/3' },
    { key: 'price', label: t('market.overview.price'), sortable: true },
    { key: 'totalSales', label: t('market.overview.totalSales'), sortable: true },
    { key: 'marketCap', label: t('market.overview.marketCap'), sortable: true },
    { key: 'changePct', label: t('market.overview.change'), sortable: true },
];
</script>

<template>
    <UCard class="w-full">
        <div class="flex flex-col gap-4">
            <p class="font-semibold">{{ title }}</p>

            <UTable v-model:sort="sortBy" :columns="columns" :rows="paginatedRows" sort-mode="manual">
                <template #price-data="{ row }">{{ row.price.toFixed(2) }}</template>
                <template #totalSales-data="{ row }">{{ row.totalSales.toLocaleString() }}</template>
                <template #marketCap-data="{ row }">{{ row.marketCap.toLocaleString() }}</template>
                <template #changePct-data="{ row }">
                    <MarketChange :change="row.changePct" />
                </template>
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
