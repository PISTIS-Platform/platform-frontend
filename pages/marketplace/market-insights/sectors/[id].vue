<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

import { AssetPerformanceList, BasicAsset, SectorCard, SectorSalesByTimeframe } from '~/interfaces/market-insights';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const { t } = useI18n();

const route = useRoute();

//TODO:: error handling (watchers for each error?) and add loading/skeleton componenents

const sectorTimeframeSelection = ref('W');

const { data: sector } = await useLazyFetch<SectorCard>(`/api/market-insights/sectors/${route.params.id}`);

const sectorCardItems = computed(() => {
    if (!sector.value) {
        return [];
    }

    const sectorInfoItems = sector.value.changeTimeframeAgo[sectorTimeframeSelection.value];

    const iconsMapping = {
        [t('market.totalSales')]: 'i-heroicons-presentation-chart-bar',
        [t('market.revenue')]: 'i-heroicons-currency-dollar',
        [t('market.marketCap')]: 'i-heroicons-shopping-bag',
    };

    return sectorInfoItems.map((item: { label: string; change: number; value: number }) => {
        return {
            ...item,
            icon: iconsMapping[item.label],
            value: item.label === t('market.revenue') ? `${item.value} EUR` : item.value,
        };
    });
});

//Sector sales - bar chart

//Stacked Bar chart
const { data: fetchedSectorSalesByDateData } = await useLazyFetch<SectorSalesByTimeframe>(
    '/api/market-insights/sectors/sales-by-date',
    {
        query: { sectorId: route.params.id },
    },
);

const sectorsSalesTimeframeSelection = ref('W');

const sectorsSales = computed(() => {
    if (!fetchedSectorSalesByDateData.value) {
        return null;
    }

    const fetchedDataByTimeframeSelection = fetchedSectorSalesByDateData.value[sectorsSalesTimeframeSelection.value];

    const datasets = fetchedDataByTimeframeSelection.data.map((sectorItem: { label: string; data: number }) => {
        return {
            label: sectorItem.label,
            data: sectorItem.data,
            backgroundColor: '#88DAEA',
        };
    });

    return {
        data: {
            labels: fetchedDataByTimeframeSelection.dates,
            datasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    };
});

// Assets Performance (top & worst) data fetching
const { data: fetchedAssetsPerformanceData } = await useLazyFetch<AssetPerformanceList>(
    '/api/market-insights/sectors/asset-performance-by-sector',
    {
        query: { sectorId: route.params.id },
    },
);

//computed property for assets data based on sector selection
const computedAssetPerformanceData = computed(() => {
    if (!fetchedAssetsPerformanceData.value || !sector) {
        return {
            top: {},
            worst: {},
        };
    }

    return fetchedAssetsPerformanceData.value;
});

// Top Performing assets
const { data: fetchedTopPerformingAssets } = await useLazyFetch<BasicAsset[]>(
    '/api/market-insights/sectors/top-performing-assets-by-sector',
    {
        query: { sectorId: route.params.id },
    },
);

const topPerformingAssets = computed(() => {
    if (!fetchedTopPerformingAssets.value) {
        return [];
    }

    return fetchedTopPerformingAssets.value;
});
</script>

<template>
    <PageContainer>
        <!-- Sectors Info Card -->
        <UCard v-if="sector" class="w-full">
            <div class="flex flex-col gap-6">
                <div class="flex justify-between gap-12">
                    <span class="text-gray-600 text-xl font-bold">{{ sector.name }}</span>
                    <TimeframeSelector v-model="sectorTimeframeSelection" />
                </div>

                <div class="flex flex-col gap-4 lg:flex-row lg:gap-0 justify-between">
                    <div v-for="item in sectorCardItems" :key="item.label" class="flex items-center gap-2">
                        <UIcon :name="item.icon" class="h-6 w-6 text-primary-500" />
                        <span class="text-gray-500 text-sm">{{ item.label }}</span>
                        <span class="text-gray-600 text-2xl ml-2 font-bold">{{ item.value }}</span>
                        <ChangeText :change-value="item.change" size="sm" mode="rounded" class="ml-2" />
                    </div>
                </div>
            </div>
        </UCard>

        <!-- Sector Bar Chart-->
        <ChartContainer v-if="sectorsSales" :title="$t('market.sectors.allSectorsSales')" class="mt-8">
            <template #right-header>
                <TimeframeSelector v-model="sectorsSalesTimeframeSelection" is-interval></TimeframeSelector>
            </template>

            <Bar class="w-full h-full" :data="sectorsSales.data" :options="sectorsSales.options" />
        </ChartContainer>

        <!-- Moving averages -->
        <!-- <ChartContainer :title="$t('market.sectors.movingAverages')" class="mt-8">
            <div class="h-52"></div>
        </ChartContainer> -->

        <!-- Pie chart and right chart -->
        <!-- <div class="flex justify-between items-center gap-6 mt-8 w-full">
            <ChartContainer :title="$t('market.sectors.marketCapPerSector')" class="w-1/2">
                <div class="h-52"></div>
            </ChartContainer>
            <ChartContainer :title="$t('market.sectors.totalSalesPerSector')" class="w-1/2">
                <div class="h-52"></div>
            </ChartContainer>
        </div> -->

        <!-- Assets Performance by sector-->
        <div v-if="sector" class="flex flex-col gap-8 w-full mt-8">
            <SubHeading :title="$t('market.sectors.assetsPerformanceBySector')" />

            <AssetsPerformanceCard :asset-data="computedAssetPerformanceData"></AssetsPerformanceCard>
        </div>

        <!-- Top Performing Assets -->
        <div v-if="sector" class="flex flex-col gap-8 w-full mt-8">
            <SubHeading :title="$t('market.sectors.topPerformingAssets')" />

            <TopPerformingAssetsList :assets-list="topPerformingAssets"></TopPerformingAssetsList>
        </div>
    </PageContainer>
</template>
