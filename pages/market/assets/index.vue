<script lang="ts" setup>
import { BasicAsset } from '~/interfaces/market-insights';
import type Selection from '~/interfaces/selection';

const { t } = useI18n();

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

const selectedInterval = ref('D');

//TODO: Get asset data from API call
const assets: BasicAsset[] = [
    {
        id: 1,
        name: 'Asset 1',
        price: 20000,
        change: 4.6,
        data: [13, 56, 34, 20, 34, 45, 60],
    },
    {
        id: 2,
        name: 'Asset 2',
        price: 45000,
        change: 9.6,
        data: [13, 56, 34, 20, 34, 45, 60].reverse(),
    },
    {
        id: 3,
        name: 'Asset 3',
        price: 90000,
        change: -5.6,
        data: [90, 16, 34, 20, 34, 45, 60],
    },
    {
        id: 4,
        name: 'Asset 4',
        price: 90000,
        change: 0,
        data: [13, 56, 34, 20, 34, 45, 60],
    },
];

//TODO: Get / find out actual sectors
const sectors: Selection[] = [
    {
        label: t('sectors.aviation'),
        value: 'aviation',
    },
    {
        label: t('sectors.energy'),
        value: 'energy',
    },
];

const selectedSector = ref(sectors[0]);

const { data: lineChartData, pending: lineChartPending } = useFetch('/api/market-insights/assets/assets-vs-average');

const computedLineChartData = computed(() => {
    if (!lineChartData.value)
        return {
            labels: [],
            datasets: [
                {
                    label: '',
                    data: [],
                },
            ],
        };

    return {
        labels: lineChartData.value.labels,
        datasets: lineChartData.value[selectedSector.value.value][selectedInterval.value],
    };
});

const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
};

const assetsColumns = [
    {
        key: 'name',
        label: t('market.assets.assetsTable.assetName'),
        sortable: true,
    },
    {
        key: 'price',
        label: t('market.assets.assetsTable.price'),
        sortable: true,
    },
    {
        key: 'totalSales',
        label: t('market.assets.assetsTable.totalSales'),
        sortable: true,
    },
    {
        key: 'marketCap',
        label: t('market.assets.assetsTable.marketCap'),
        sortable: true,
    },
    {
        key: 'change',
        label: t('market.assets.assetsTable.change'),
        sortable: true,
    },
];

interface AssetTableRow {
    id: number;
    name: string;
    price: number;
    totalSales: number;
    marketCap: number;
    change: number;
}

const assetsData = ref<AssetTableRow[]>([
    {
        id: 1,
        name: 'Asset 1',
        price: 11,
        totalSales: 234,
        marketCap: 3000,
        change: 50,
    },
    {
        id: 2,
        name: 'Asset 2',
        price: 20,
        totalSales: 345,
        marketCap: 24324,
        change: -40,
    },
    {
        id: 3,
        name: 'Asset 3',
        price: 1,
        totalSales: 1500,
        marketCap: 1235,
        change: 30,
    },
    {
        id: 4,
        name: 'Asset 4',
        price: 3,
        totalSales: 8576,
        marketCap: 9008,
        change: -15,
    },
    {
        id: 5,
        name: 'Asset 5',
        price: 3,
        totalSales: 8576,
        marketCap: 9008,
        change: -15,
    },
    {
        id: 6,
        name: 'Asset 6',
        price: 3,
        totalSales: 8576,
        marketCap: 9008,
        change: -15,
    },
    {
        id: 7,
        name: 'Asset 7',
        price: 3,
        totalSales: 8576,
        marketCap: 9008,
        change: -15,
    },
]);

const assetsPageCount = 5;

const {
    page: assetsPage,
    sortBy: assetsSortBy,
    searchString: assetsSearchString,
    filteredRows: assetsFilteredRows,
    paginatedRows: assetsPaginatedRows,
} = useTable<AssetTableRow>(assetsData, assetsPageCount, {
    column: 'name',
    direction: 'asc',
});

//TODO: Either have computed object that changes with sectors for table or watcher that calls API again

const transactionsColumns = [
    {
        key: 'name',
        label: t('market.assets.transactionsTable.assetName'),
        sortable: true,
    },
    {
        key: 'price',
        label: t('market.assets.transactionsTable.price'),
        sortable: true,
    },
    {
        key: 'transactionDate',
        label: t('market.assets.transactionsTable.transactionDate'),
        sortable: true,
    },
    {
        key: 'sector',
        label: t('market.assets.transactionsTable.sector'),
        sortable: true,
    },
];

interface TransactionsTableRow {
    id: number;
    name: string;
    price: number;
    transactionDate: string;
    sector: string;
}

//TODO: Bring dates in YYYYY/MM/DD format for sorting
const transactionsData = ref<TransactionsTableRow[]>([
    {
        id: 1,
        name: 'Asset 1',
        price: 11,
        transactionDate: '20/01/2024',
        sector: 'Aviation',
    },
    {
        id: 2,
        name: 'Asset 2',
        price: 20,
        transactionDate: '14/01/2024',
        sector: 'Aviation',
    },
    {
        id: 3,
        name: 'Asset 3',
        price: 1,
        transactionDate: '10/01/2024',
        sector: 'Aviation',
    },
    {
        id: 4,
        name: 'Asset 4',
        price: 3,
        transactionDate: '11/01/2024',
        sector: 'Energy',
    },
    {
        id: 5,
        name: 'Asset 5',
        price: 3,
        transactionDate: '23/01/2024',
        sector: 'Aviation',
    },
    {
        id: 6,
        name: 'Asset 6',
        price: 3,
        transactionDate: '01/02/2024',
        sector: 'Energy',
    },
    {
        id: 7,
        name: 'Asset 7',
        price: 3,
        transactionDate: '14/01/2024',
        sector: 'Energy',
    },
]);

const transactionsPageCount = 5;

const {
    page: transactionsPage,
    sortBy: transactionsSortBy,
    searchString: transactionsSearchString,
    filteredRows: transactionsFilteredRows,
    paginatedRows: transactionsPaginatedRows,
} = useTable<TransactionsTableRow>(transactionsData, transactionsPageCount, {
    column: 'name',
    direction: 'asc',
});
</script>

<template>
    <PageContainer>
        <SubHeading :title="$t('market.assets.topPerforming')" />
        <div class="flex mt-6 gap-6 w-full">
            <UCard v-for="asset in assets" :key="asset.name" class="w-full">
                <RollingAsset :asset-info="asset" />
            </UCard>
        </div>
        <ChartContainer :title="$t('market.assets.timeline')" class="mt-6 h-96">
            <template #right-header>
                <div class="flex items-center gap-6">
                    <TimeframeSelector v-model="selectedInterval" is-interval />
                    <USelectMenu v-model="selectedSector" size="md" :options="sectors" />
                </div>
            </template>
            <div class="h-72 w-full mt-1">
                <!-- TODO: Put loading skeleton or spinner here-->
                <Line
                    v-if="!lineChartPending"
                    class="w-full h-full"
                    :data="computedLineChartData"
                    :options="lineChartOptions"
                />
            </div>
        </ChartContainer>
        <ChartContainer :title="$t('market.assets.assetsOverview')" class="mt-6 h-[450px] relative">
            <template #right-header>
                <UInput v-model="assetsSearchString" size="md" :placeholder="$t('search')" class="w-full ml-6" />
                <USelectMenu v-model="selectedSector" size="md" :options="sectors" class="ml-6" />
            </template>
            <UTable v-model:sort="assetsSortBy" :columns="assetsColumns" :rows="assetsPaginatedRows" sort-mode="manual">
                <template #change-data="{ row }">
                    <ChangeText :change-value="row.change" />
                </template>
                <template #name-data="{ row }">
                    <NuxtLink :to="`assets/${row.id}`">{{ row.name }}</NuxtLink>
                </template>
            </UTable>
            <UPagination
                v-if="assetsFilteredRows.length > assetsPageCount"
                v-model="assetsPage"
                :page-count="assetsPageCount"
                :total="assetsFilteredRows.length"
                class="absolute bottom-6 right-6"
            />
        </ChartContainer>
        <ChartContainer :title="$t('market.assets.transactionsOverview')" class="mt-6 h-[450px] relative">
            <template #right-header>
                <UInput v-model="transactionsSearchString" size="md" :placeholder="$t('search')" class="w-full ml-6" />
                <USelectMenu v-model="selectedSector" size="md" :options="sectors" class="ml-6" />
            </template>
            <UTable
                v-model:sort="transactionsSortBy"
                :columns="transactionsColumns"
                :rows="transactionsPaginatedRows"
                sort-mode="manual"
            >
                <template #name-data="{ row }">
                    <NuxtLink :to="`assets/${row.id}`">{{ row.name }}</NuxtLink>
                </template>
            </UTable>
            <UPagination
                v-if="transactionsFilteredRows.length > transactionsPageCount"
                v-model="transactionsPage"
                :page-count="transactionsPageCount"
                :total="transactionsFilteredRows.length"
                class="absolute bottom-6 right-6"
            />
        </ChartContainer>
    </PageContainer>
</template>
