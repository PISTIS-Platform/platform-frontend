<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

import { AssetPerformanceList, BasicAsset, SectorSalesByTimeframe } from '~/interfaces/market-insights';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const { t } = useI18n();

const route = useRoute();

const sectorTimeframeSelection = ref('W');

//TODO: fix type
const sector: Record<string, any> = {
    id: route.params.id,
    name: 'Sector 1',
    changeTimeframeAgo: {
        D: {
            change: 13,
            totalSales: 230,
            marketCap: 400,
        },
        W: {
            change: 60,
            totalSales: 450,
            marketCap: 890,
        },
        M: {
            change: -70,
            totalSales: 100,
            marketCap: 200,
        },
    },
};

const changeSinceTimeframeAgoText = computed(() => {
    if (sectorTimeframeSelection.value === 'D') {
        return t('market.changeSince1DayAgo');
    }

    if (sectorTimeframeSelection.value === 'W') {
        return t('market.changeSince1WeekAgo');
    }

    return t('market.changeSince1MonthAgo');
});

//Sector sales - bar chart

//Stacked Bar chart
const { data: fetchedSectorSalesByDateData } = await useLazyFetch<SectorSalesByTimeframe>(
    '/api/market-insights/sectors/sales-by-date',
    {
        query: { sectorId: sector.id },
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
//TODO:: add loading for asset performance data
const { data: fetchedAssetsPerformanceData } = await useLazyFetch<AssetPerformanceList>(
    '/api/market-insights/sectors/asset-performance-by-sector',
    {
        query: { sectorId: sector.id },
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
        query: { sectorId: sector.id },
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
        <UCard class="w-full">
            <div class="flex flex-col gap-6">
                <div class="flex justify-between gap-12">
                    <span class="text-gray-600 text-xl font-bold">{{ sector.name }}</span>
                    <TimeframeSelector v-model="sectorTimeframeSelection" />
                </div>

                <div class="flex gap-48">
                    <div>
                        <span class="text-gray-500 text-sm">{{ changeSinceTimeframeAgoText }}</span>
                        <ChangeText
                            :change-value="sector.changeTimeframeAgo[sectorTimeframeSelection].change"
                            size="2xl"
                            class="ml-2"
                        />
                    </div>
                    <div>
                        <span class="text-gray-500 text-sm">{{ $t('market.totalSales') }}</span>
                        <span class="text-gray-600 text-2xl ml-2 font-bold"
                            >{{ sector.changeTimeframeAgo[sectorTimeframeSelection].totalSales }}STC</span
                        >
                    </div>
                    <div>
                        <span class="text-gray-500 text-sm">{{ $t('market.marketCap') }}</span>
                        <span class="text-gray-600 text-2xl ml-2 font-bold">{{
                            sector.changeTimeframeAgo[sectorTimeframeSelection].marketCap
                        }}</span>
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
