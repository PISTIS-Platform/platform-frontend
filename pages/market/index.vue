<script setup lang="ts">
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement);
const selection = ref('W');
const pageCount = 5;
const { t } = useI18n();

const triggerChangeSelection = (value: string) => {
    selection.value = value;
};

const { data: sectors } = await useLazyFetch<Record<string, any>[]>('/api/market-insights/sectors-data');

const selectedSector = computed(() => (sectors.value ? sectors.value[0] : null));
const { data: topPerformanceData } = await useLazyFetch('/api/market-insights/overview/top-performance-data');
const { data: worstPerformanceData } = await useLazyFetch('/api/market-insights/overview/worst-performance-data');
const { data: latestTransactions } = await useLazyFetch('/api/market-insights/overview/latest-transactions-data');
const { data: lineChartData, pending: lineChartPending } = await useLazyFetch('/api/market-insights/total-vs-market');

const computedLineChartData = computed(() => {
    return {
        labels: lineChartData.value.labels,
        datasets: [
            {
                label: 'Total Sales',
                data: lineChartData.value.totalAsset['W'],
                borderColor: '#52d334',
                fill: false,
                tension: 0.4,
            },
            {
                label: 'Market Cap',
                data: lineChartData.value.marketCap['W'],
                borderColor: '#493cfc',
                fill: false,
                tension: 0.4,
            },
        ],
    };
});

const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
};

const {
    page: pageTopAsset,
    sortBy: sortByTopAsset,
    filteredRows: filteredRowsTopAsset,
    paginatedRows: paginatedRowsTopAsset,
} = useTable(topPerformanceData, pageCount);

const {
    page: pageWorstAsset,
    sortBy: sortByWorstAsset,
    filteredRows: filteredRowsWorstAsset,
    paginatedRows: paginatedRowsWorstAsset,
} = useTable(worstPerformanceData, pageCount);

const {
    page: pageTransaction,
    sortBy: sortByTransaction,
    filteredRows: filteredRowsTransaction,
    paginatedRows: paginatedRowsTransaction,
} = useTable(latestTransactions, pageCount);

const { data: assets } = await useLazyFetch('/api/market-insights/rolling-assets-data');
const transactionsColumns = [
    {
        key: 'asset_name',
        label: t('market.overview.assetName'),
        sortable: true,
        direction: 'desc',
        class: 'w-1/5',
    },
    {
        key: 'transaction_date',
        label: t('market.overview.transactionDate'),
        sortable: true,
        class: 'w-1/4',
    },
    {
        key: 'sector',
        label: t('market.overview.sector'),
        sortable: true,
        class: 'w-1/4',
    },
    {
        key: 'price',
        label: t('market.overview.price'),
        sortable: true,
        class: 'w-1/4',
    },
];

const performingColumns = [
    {
        key: 'asset_name',
        label: t('market.overview.assetName'),
        sortable: true,
        direction: 'desc',
        class: 'w-1/4',
    },
    {
        key: 'price',
        label: t('market.overview.price'),
        sortable: true,
        class: 'w-1/5',
    },
    {
        key: 'total_sales',
        label: t('market.overview.totalSales'),
        sortable: true,
        class: 'w-1/5',
    },
    {
        key: 'market_cap',
        label: t('market.overview.marketCap'),
        sortable: true,
        class: 'w-1/5',
    },
    {
        key: 'change',
        label: t('market.overview.change'),
        sortable: true,
        class: 'w-1/5',
    },
];
</script>

<template>
    <PageContainer>
        <RollingAssetsBar v-if="assets" :assets="assets" />
        <div class="flex flex-row w-full mt-4">
            <div class="flex flex-col w-1/2">
                <div class="flex flex-row mr-2 mb-2">
                    <UCard class="mr-2 w-1/2">
                        <p class="text-xl text-center font-bold">{{ t('market.overview.totalAssets') }}</p>
                        <br />
                        <p class="text-center">20000</p>
                    </UCard>
                    <UCard class="w-1/2">
                        <p class="text-xl text-center font-bold h-18">{{ t('market.overview.averageSales') }}</p>
                        <br />
                        <p class="text-center">20000</p></UCard
                    >
                </div>
                <div class="flex flex-row mr-2">
                    <UCard class="w-1/2 mr-2">
                        <p class="text-xl text-center font-bold">{{ t('market.overview.totalMarketCap') }}</p>
                        <br />
                        <p class="text-center">20000</p>
                    </UCard>
                    <UCard class="w-1/2">
                        <p class="text-xl text-center font-bold">{{ t('market.overview.totalSales') }}</p>
                        <br />
                        <p class="text-center">20000</p>
                    </UCard>
                </div>
            </div>
            <div class="flex flex-col w-1/4 mr-1">
                <UCard class="w-full h-full">
                    <TimeframeSelector
                        class="w-full mb-8"
                        :model-value="selection"
                        :is-interval="false"
                        @update:model-value="triggerChangeSelection"
                    ></TimeframeSelector>

                    <div class="flex flex-row justify-between">
                        <div class="text-green-500">+30%</div>
                        <div class="text-right mb-4">
                            {{ t('market.overview.changeIn') }} {{ t('market.overview.value') }}
                        </div>
                    </div>
                    <div class="flex flex-row justify-between">
                        <div class="text-red-500">-20%</div>
                        <div class="text-right">
                            {{ t('market.overview.changeIn') }} {{ t('market.overview.volume') }}
                        </div>
                    </div>
                </UCard>
            </div>
            <div class="flex flex-col h-full w-1/4">
                <UCard class="w-full h-full">
                    <p class="text-xl text-center font-bold">{{ t('market.overview.salesVolume') }}</p>

                    <div class="flex flex-col">
                        <div class="flex flex-row mb-4 mt-4 justify-between">
                            <div class="basis-1/2">{{ t('market.overview.increase') }}</div>
                            <div class="text-green-500">300</div>
                        </div>
                        <UDivider />
                        <div class="flex flex-row mb-4 mt-4 justify-between">
                            <div class="basis-1/2">{{ t('market.overview.decrease') }}</div>
                            <div class="text-red-500">200</div>
                        </div>
                        <UDivider />
                        <div class="flex flex-row mb-4 mt-4 justify-between">
                            <div class="basis-1/2">{{ t('market.overview.stable') }}</div>
                            <div class="text-gray-500">1000</div>
                        </div>
                    </div>
                </UCard>
            </div>
        </div>

        <div class="w-full mt-4">
            <ChartContainer :title="$t('market.overview.timeline')" class="mt-6 h-96">
                <template #right-header>
                    <div class="flex items-center gap-6">
                        <TimeframeSelector :model-value="selection" is-interval />
                    </div>
                </template>
                <div class="h-72 w-full mt-1">
                    <Line
                        v-if="!lineChartPending"
                        class="w-full h-full"
                        :data="computedLineChartData"
                        :options="lineChartOptions"
                    />
                </div>
            </ChartContainer>
        </div>

        <div class="w-full mt-4">
            <ChartContainer :title="$t('market.overview.topPerforming')" class="mt-6 mr-4">
                <template #right-header>
                    <TimeframeSelector
                        class="mb-6 right-0"
                        :model-value="selection"
                        :is-interval="true"
                        @update:model-value="triggerChangeSelection"
                    ></TimeframeSelector>
                    <USelectMenu v-model="selectedSector" size="md" :options="sectors" class="ml-6" />
                </template>
                <UTable
                    v-model:sort="sortByTopAsset"
                    :columns="performingColumns"
                    :rows="paginatedRowsTopAsset"
                    sort-mode="manual"
                >
                    <template #change-data="{ row }">
                        <ChangeText :change-value="row.change" />
                    </template>
                </UTable>
                <UPagination
                    v-model="pageTopAsset"
                    :page-count="pageCount"
                    :total="filteredRowsTopAsset.length"
                    :active-button="{ variant: 'outline' }"
                />
            </ChartContainer>
        </div>
        <div class="w-full mt-4">
            <ChartContainer :title="$t('market.overview.worstPerforming')" class="mt-6">
                <template #right-header>
                    <TimeframeSelector
                        class="mb-6 right-0"
                        :model-value="selection"
                        :is-interval="true"
                        @update:model-value="triggerChangeSelection"
                    ></TimeframeSelector>
                    <USelectMenu v-model="selectedSector" size="md" :options="sectors" class="ml-6" />
                </template>
                <UTable
                    v-model:sort="sortByWorstAsset"
                    :columns="performingColumns"
                    :rows="paginatedRowsWorstAsset"
                    sort-mode="manual"
                >
                    <template #change-data="{ row }">
                        <ChangeText :change-value="row.change" />
                    </template>
                </UTable>
                <UPagination
                    v-model="pageWorstAsset"
                    :page-count="pageCount"
                    :total="filteredRowsWorstAsset.length"
                    :active-button="{ variant: 'outline' }"
                />
            </ChartContainer>
        </div>
        <div class="w-full mt-4">
            <ChartContainer :title="$t('market.overview.latestTransactions')" class="mt-6">
                <template #right-header>
                    <USelectMenu v-model="selectedSector" size="md" :options="sectors" class="ml-6" />
                </template>
                <UTable
                    v-model:sort="sortByTransaction"
                    :columns="transactionsColumns"
                    :rows="paginatedRowsTransaction"
                    sort-mode="manual"
                >
                    <template #change-data="{ row }">
                        <ChangeText :change-value="row.change" />
                    </template>
                </UTable>
                <UPagination
                    v-model="pageTransaction"
                    :page-count="pageCount"
                    :total="filteredRowsTransaction.length"
                    :active-button="{ variant: 'outline' }"
                />
            </ChartContainer>
        </div>
    </PageContainer>
</template>
../../server/routes/api/market-insights/dummy-overview-data
