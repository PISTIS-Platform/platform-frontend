<script setup lang="ts">
import { useRoute } from 'nuxt/app';

import { BasicAsset } from '~/interfaces/market-insights';
import type Selection from '~/interfaces/selection';

const { t } = useI18n();

import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Bar, Line } from 'vue-chartjs';

const chartOptions = { responsive: true, maintainAspectRatio: false };

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const route = useRoute();

const _assetID = route.params.id;

//TODO: Get asset info from API call
const assets: BasicAsset[] = [
    {
        name: 'Asset 1',
        price: 20000,
        change: 4.6,
        data: [13, 56, 34, 20, 34, 45, 60],
    },
    {
        name: 'Asset 2',
        price: 45000,
        change: 9.6,
        data: [13, 56, 34, 20, 34, 45, 60].reverse(),
    },
    {
        name: 'Asset 3',
        price: 90000,
        change: -5.6,
        data: [90, 16, 34, 20, 34, 45, 60],
    },
    {
        name: 'Asset 4',
        price: 90000,
        change: 0,
        data: [13, 56, 34, 20, 34, 45, 60],
    },
];

//TODO: Get with API call using asset ID
const assetInfo = {
    title: 'Asset Title Here',
    seller: 'Seller Name Here',
    views: 500000,
    monetization_plan: 'Subscription',
    data_quality_index: 5,
    sector: 'Aviation',
};

//Data for latest transactions table
const transactionsColumns = [
    {
        key: 'price',
        label: t('market.assets.latestTransTable.price'),
        sortable: true,
    },
    {
        key: 'transactionDate',
        label: t('market.assets.latestTransTable.transactionDate'),
        sortable: true,
    },
    {
        key: 'plan',
        label: t('market.assets.latestTransTable.plan'),
        sortable: true,
    },
    {
        key: 'buyer',
        label: t('market.assets.latestTransTable.buyer'),
        sortable: true,
    },
];

interface TransactionsTableRow {
    price: number;
    transactionDate: string;
    plan: string;
    buyer: string;
}

//TODO: Get rows/data from API call
//TODO: Bring dates in YYYYY/MM/DD format for sorting
const transactionsData = ref<TransactionsTableRow[]>([
    {
        price: 11,
        transactionDate: '20/01/2024',
        plan: 'Subscription',
        buyer: 'Buyer',
    },
    {
        price: 11,
        transactionDate: '20/01/2024',
        plan: 'Subscription',
        buyer: 'Buyer',
    },
    {
        price: 11,
        transactionDate: '20/01/2024',
        plan: 'Subscription',
        buyer: 'Buyer',
    },
    {
        price: 11,
        transactionDate: '20/01/2024',
        plan: 'Subscription',
        buyer: 'Buyer',
    },
    {
        price: 11,
        transactionDate: '20/01/2024',
        plan: 'Subscription',
        buyer: 'Buyer',
    },
]);

const transactionsPageCount = 5;

const {
    page: transactionsPage,
    sortBy: transactionsSortBy,
    filteredRows: transactionsFilteredRows,
    paginatedRows: transactionsPaginatedRows,
} = useTable<TransactionsTableRow>(transactionsData, transactionsPageCount, {
    column: 'assetName',
    direction: 'asc',
});

//Data for asset performance table

const performanceColumns = [
    {
        key: 'year',
        label: t('market.assets.performanceTable.year'),
        sortable: true,
    },
    {
        key: 'jan',
        label: t('market.assets.performanceTable.jan'),
    },
    {
        key: 'feb',
        label: t('market.assets.performanceTable.feb'),
    },
    {
        key: 'mar',
        label: t('market.assets.performanceTable.mar'),
    },
    {
        key: 'apr',
        label: t('market.assets.performanceTable.apr'),
    },
    {
        key: 'may',
        label: t('market.assets.performanceTable.may'),
    },
    {
        key: 'jun',
        label: t('market.assets.performanceTable.jun'),
    },
    {
        key: 'jul',
        label: t('market.assets.performanceTable.jul'),
    },
    {
        key: 'aug',
        label: t('market.assets.performanceTable.aug'),
    },
    {
        key: 'sep',
        label: t('market.assets.performanceTable.sep'),
    },
    {
        key: 'oct',
        label: t('market.assets.performanceTable.oct'),
    },
    {
        key: 'nov',
        label: t('market.assets.performanceTable.nov'),
    },
    {
        key: 'dec',
        label: t('market.assets.performanceTable.dec'),
    },
    {
        key: 'total',
        label: t('market.assets.performanceTable.total'),
        sortable: true,
    },
];

interface PerformanceTableRow {
    [key: string]: number;
}

//TODO: Get performance table data from API call
//TODO: See if 0 or null makes more sense when bringing data to table for months that don't exist yet
const performanceData = ref<PerformanceTableRow[]>([
    {
        year: 2024,
        jan: 3,
        feb: 35,
        mar: 20,
        apr: 0,
        may: 0,
        jun: 0,
        jul: 0,
        aug: 0,
        sep: 0,
        oct: 0,
        nov: 0,
        dec: 0,
        total: 58,
    },
    {
        year: 2023,
        jan: 5,
        feb: 20,
        mar: 15,
        apr: 32,
        may: 40,
        jun: 10,
        jul: 5,
        aug: 25,
        sep: 2,
        oct: 12,
        nov: 32,
        dec: 35,
        total: 250,
    },
]);

//TODO: Bring data from API call for both chart and table sales data

const barChartSalesData = ref({
    2024: [40, 20, 12, 39, 10, 40, 39, 20, 40, 20, 12, 11],
    2023: [40, 20, 12, 39, 10, 40, 39, 20, 40, 20, 12, 11].reverse(),
});
const barChartData = computed(() => ({
    labels: [
        t('market.assets.performanceTable.jan'),
        t('market.assets.performanceTable.feb'),
        t('market.assets.performanceTable.mar'),
        t('market.assets.performanceTable.apr'),
        t('market.assets.performanceTable.may'),
        t('market.assets.performanceTable.jun'),
        t('market.assets.performanceTable.jul'),
        t('market.assets.performanceTable.aug'),
        t('market.assets.performanceTable.sep'),
        t('market.assets.performanceTable.oct'),
        t('market.assets.performanceTable.nov'),
        t('market.assets.performanceTable.dec'),
    ],
    datasets: [
        {
            label: 'Sales',
            backgroundColor: '#7BA3A2',
            data: barChartSalesData.value[performanceSelected.value[0].year],
        },
    ],
}));

const performancePageCount = 5;

const performanceSelected = ref([performanceData.value[0]]);

const performanceSelect = (value: PerformanceTableRow) => {
    performanceSelected.value = [value];
};

const {
    page: performancePage,
    sortBy: performanceSortBy,
    filteredRows: performanceFilteredRows,
    paginatedRows: performancePaginatedRows,
} = useTable<PerformanceTableRow>(performanceData, performancePageCount, {
    column: 'year',
    direction: 'desc',
});

//Data for line performance comparison charts

const comparisonModes: Selection[] = [
    {
        label: t('market.assets.comparisonModes.sales'),
        value: 'sales',
    },
    {
        label: t('market.assets.comparisonModes.marketCap'),
        value: 'market_cap',
    },
    {
        label: t('market.assets.comparisonModes.otherAsset'),
        value: 'other_asset',
    },
];

const selectedComparisonMode = ref(comparisonModes[0]);

const selectedInterval = ref('D');

const assetsSearchString = ref('');

const { data: lineChartData, pending: _lineChartPending } = useFetch('/api/market-insights/assets/comparison');

//TODO: reactive API call for changing ID/name of second asset to be compared to main one

const { data: assetLineChartData, pending: _assetLineChartPending } = useFetch(
    '/api/market-insights/assets/asset-sales',
);
//TODO: This API call to be deleted when individual param is fixed
const { data: otherLineChartData, pending: _otherLineChartPending } = useFetch(
    '/api/market-insights/assets/other-asset-sales',
);

const computedLineChartData = computed(() => {
    if (!lineChartData.value || !assetLineChartData.value || !otherLineChartData.value)
        return {
            labels: [],
            datasets: [
                {
                    label: '',
                    data: [],
                },
            ],
        };
    if (selectedComparisonMode.value.value === 'other_asset')
        return {
            labels: lineChartData.value.labels,
            datasets: [
                assetLineChartData.value.sales_data[selectedInterval.value],
                otherLineChartData.value.sales_data[selectedInterval.value],
            ],
        };

    return {
        labels: lineChartData.value.labels,
        datasets: [
            assetLineChartData.value.sales_data[selectedInterval.value],
            ...lineChartData.value[selectedComparisonMode.value.value][selectedInterval.value],
        ],
    };
});
</script>

<template>
    <PageContainer>
        <RollingAssetsBar :assets="assets" />
        <ChartContainer :title="assetInfo.title" class="mt-6">
            <div class="flex w-full justify-between items-center text-gray-500">
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-user" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Seller: <span class="font-bold">{{ assetInfo.seller }}</span></span
                    >
                </div>
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-eye" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Views: <span class="font-bold">{{ $n(assetInfo.views) }}</span></span
                    >
                </div>
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-money-bill-1" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Monetisation Plan: <span class="font-bold">{{ assetInfo.monetization_plan }}</span></span
                    >
                </div>
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-rectangle-list" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Sector: <span class="font-bold">{{ assetInfo.sector }}</span></span
                    >
                </div>
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-file-lines" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Data Quality Index: <span class="font-bold">{{ assetInfo.data_quality_index }}</span></span
                    >
                </div>
            </div>
        </ChartContainer>
        <ChartContainer :title="$t('market.assets.assetPerformance')" class="mt-6 flex flex-col gap-6">
            <div class="w-full h-96">
                <Bar :data="barChartData" :options="chartOptions" class="w-full" />
            </div>
            <div class="flex-col flex">
                <UTable
                    v-model="performanceSelected"
                    v-model:sort="performanceSortBy"
                    :ui="{ tr: { selected: 'bg-primary-50' } }"
                    :columns="performanceColumns"
                    :rows="performancePaginatedRows"
                    sort-mode="manual"
                    @select="performanceSelect"
                >
                </UTable>
                <UPagination
                    v-if="performanceFilteredRows.length > performancePageCount"
                    v-model="performancePage"
                    :page-count="performancePageCount"
                    :total="performanceFilteredRows.length"
                    class="self-end"
                />
            </div>
        </ChartContainer>
        <ChartContainer class="mt-6" :title="$t('market.assets.performanceComparison')">
            <template #right-header>
                <div class="flex gap-6 items-center w-full">
                    <UInput v-model="assetsSearchString" size="md" :placeholder="$t('search')" class="w-full ml-6" />
                    <TimeframeSelector v-model="selectedInterval" is-interval />
                    <USelectMenu v-model="selectedComparisonMode" size="md" :options="comparisonModes" />
                </div>
            </template>
            <div class="w-full h-96">
                <Line :data="computedLineChartData" :options="chartOptions" class="w-full" />
            </div>
        </ChartContainer>
        <ChartContainer :title="$t('market.assets.latestTransactions')" class="mt-6">
            <UTable
                v-model:sort="transactionsSortBy"
                :columns="transactionsColumns"
                :rows="transactionsPaginatedRows"
                sort-mode="manual"
            >
            </UTable>
            <UPagination
                v-if="transactionsFilteredRows.length > transactionsPageCount"
                v-model="transactionsPage"
                :page-count="transactionsPageCount"
                :total="transactionsFilteredRows.length"
                class="self-end"
            />
        </ChartContainer>
    </PageContainer>
</template>

//Hide the checkbox column so that only one row is selectable
<style>
.ps-4 {
    @apply hidden;
}
</style>
