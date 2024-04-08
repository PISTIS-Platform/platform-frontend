<script setup lang="ts">
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Bar, Line, Pie } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

import type {
    AssetPerformanceList,
    BasicAsset,
    BasicSector,
    SectorDataItem,
    SectorSalesByTimeframe,
    SectorsComparisonData,
} from '~/interfaces/market-insights';
import Selection from '~/interfaces/selection';

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LineElement,
    LinearScale,
    PointElement,
    Filler,
    ArcElement,
);

const { t } = useI18n();

//TODO:: error handling (watchers for each error?) and add loading/skeleton componenents

//sector basic info
const { data: sectors, pending: loadingSectorsBasicInfo } =
    await useLazyFetch<BasicSector[]>('/api/market-insights/sectors');

//Stacked Bar chart
const { data: fetchedSectorSalesByDateData } = await useLazyFetch<SectorSalesByTimeframe>(
    '/api/market-insights/sectors/sales-by-date',
);

const sectorsSalesTimeframeSelection = ref('W');

const sectorsSales = computed(() => {
    if (!fetchedSectorSalesByDateData.value) {
        return null;
    }

    const fetchedDataByTimeframeSelection = fetchedSectorSalesByDateData.value[sectorsSalesTimeframeSelection.value];
    //TODO:: TBD for palette colors for charts across market insights (and not only)
    const backgroundColors = ['#88DAEA', '#ECD076', '#6FE697'];

    const datasets = fetchedDataByTimeframeSelection.data.map(
        (
            sectorItem: {
                label: string;
                data: number;
            },
            index: number,
        ) => {
            return {
                label: sectorItem.label,
                data: sectorItem.data,
                backgroundColor: backgroundColors[index],
            };
        },
    );

    return {
        data: {
            labels: fetchedDataByTimeframeSelection.dates,
            datasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                },
            },
        },
    };
});

//moving averages selections
const nodeComparisonOptions: Selection[] = [
    {
        label: t('market.sectors.salesBySectorVsTotal'),
        value: 'by_sales',
    },
    {
        label: t('market.sectors.marketCapBySectorVsTotal'),
        value: 'by_market_cap',
    },
];
const selectedNodeComparison = ref<Selection>(nodeComparisonOptions[0]);

const { data: fetchedSectorsComparisonsData } = await useLazyFetch<SectorsComparisonData>(
    '/api/market-insights/sectors/sectors-comparisons',
);

const stackedLineOptions = computed(() => {
    if (!fetchedSectorsComparisonsData.value || !selectedNodeComparison.value) {
        return null;
    }

    const colors = ['#88DAEA', '#ECD076', '#6FE697'];

    const datasets = fetchedSectorsComparisonsData.value.sectorsData[selectedNodeComparison.value.value].map(
        (sectorItem: SectorDataItem, index: number) => {
            return {
                label: sectorItem.label,
                data: sectorItem.percentages,
                borderColor: colors[index],
                fill: {
                    target: 'origin',
                    above: colors[index],
                },
            };
        },
    );

    return {
        data: {
            labels: fetchedSectorsComparisonsData.value.timesData,
            datasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    stacked: true,
                    title: {
                        text: 'Percentage',
                        display: true,
                    },
                },
                x: {
                    title: {
                        text: 'Months',
                        display: true,
                        padding: {
                            top: 15,
                        },
                    },
                },
            },
        },
    };
});

//Pie charts
const pieChartsLabels = computed(() => {
    if (!fetchedSectorsComparisonsData.value || !selectedNodeComparison.value) {
        return [];
    }

    return fetchedSectorsComparisonsData.value.sectorsData.by_sales.map((sector: SectorDataItem) => sector.label);
});

const getPieChartsOptions = (nodeComparison: string) => {
    if (!fetchedSectorsComparisonsData.value || !selectedNodeComparison.value) {
        return null;
    }

    return {
        data: {
            labels: pieChartsLabels.value,
            datasets: [
                {
                    backgroundColor: ['#88DAEA', '#ECD076', '#6FE697'],
                    data: fetchedSectorsComparisonsData.value.sectorsData[nodeComparison].map(
                        (sector: SectorDataItem) => sector.total,
                    ),
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    };
};

const pieChartsSalesOptions = computed(() => {
    return getPieChartsOptions('by_sales');
});

const pieChartsMarketCapOptions = computed(() => {
    return getPieChartsOptions('by_market_cap');
});

//sectors
const selectedSector = ref<BasicSector | null>(null);

//TODO:: the purpose of this is that the sectors dropdown will be initialized with a value so that the data below won't be empty, check if watcher can be avoided
watch(sectors, () => {
    if (!selectedSector.value && sectors.value && sectors.value.length) {
        selectedSector.value = sectors.value[0];
    }
});

// Assets Performance (top & worst) data fetching
const { data: fetchedAssetsPerformanceData } = await useLazyFetch<Record<number, AssetPerformanceList>>(
    '/api/market-insights/sectors/asset-performance-by-sector',
);

//computed property for assets data based on sector selection
const computedAssetPerformanceData = computed(() => {
    if (!fetchedAssetsPerformanceData.value || !selectedSector.value) {
        return {
            top: {},
            worst: {},
        };
    }

    return fetchedAssetsPerformanceData.value[selectedSector.value.value];
});

// Top Performing assets
const { data: fetchedTopPerformingAssets } = await useLazyFetch<Record<number, BasicAsset[]>>(
    '/api/market-insights/sectors/top-performing-assets-by-sector',
);

const topPerformingAssets = computed(() => {
    if (!fetchedTopPerformingAssets.value || !selectedSector.value) {
        return [];
    }

    return fetchedTopPerformingAssets.value[selectedSector.value.value];
});
</script>

<template>
    <PageContainer>
        <!-- Overview section-->
        <SubHeading :title="$t('market.sectors.overview')" />

        <!-- Sectors Cards-->
        <div class="flex justify-between gap-6 items-center mt-8 w-full">
            <div v-if="loadingSectorsBasicInfo" class="flex justify-start w-full gap-8">
                <USkeleton
                    v-for="item in new Array(3)"
                    :key="item"
                    :ui="{ background: 'bg-gray-300' }"
                    class="h-24 w-72"
                />
            </div>
            <div v-for="sector in sectors" v-else :key="sector.value" class="w-full">
                <UCard>
                    <div class="flex flex-col justify-between gap-6">
                        <NuxtLink :to="`/market/sectors/${sector.value}`"
                            ><span class="text-gray-600 text-xl font-bold hover:text-gray-500">{{
                                sector.label
                            }}</span></NuxtLink
                        >
                        <span
                            >{{ $t('market.sectors.changeSince1WeekAgo') }}
                            <ChangeText :change-value="sector.change || 0" class="ml-1" size="xl"
                        /></span>
                    </div>
                </UCard>
            </div>
        </div>

        <!-- Sectors Stacked Bar Chart-->
        <ChartContainer v-if="sectorsSales" :title="$t('market.sectors.allSectorsSales')" class="mt-8">
            <template #right-header>
                <TimeframeSelector v-model="sectorsSalesTimeframeSelection" is-interval></TimeframeSelector>
            </template>

            <Bar class="w-full h-full" :data="sectorsSales.data" :options="sectorsSales.options" />
        </ChartContainer>

        <!-- Moving averages -->
        <ChartContainer v-if="stackedLineOptions" :title="$t('market.sectors.movingAverages')" class="mt-8">
            <template #right-header>
                <div class="flex justify-end items-center gap-4">
                    <span class="text-sm ml-2">{{ $t('compareBy') }}:</span>
                    <USelectMenu
                        v-model="selectedNodeComparison"
                        :options="nodeComparisonOptions"
                        class="w-80"
                    ></USelectMenu>
                </div>
            </template>

            <div class="h-96">
                <Line :data="stackedLineOptions.data" :options="stackedLineOptions.options"></Line>
            </div>
        </ChartContainer>

        <!-- Pie charts , right and left -->
        <div class="flex justify-between items-center gap-6 mt-8 w-full">
            <ChartContainer
                v-if="pieChartsMarketCapOptions"
                :title="$t('market.sectors.totalSalesPerSector')"
                class="w-1/2"
            >
                <div class="h-72">
                    <Pie :data="pieChartsMarketCapOptions.data" :options="pieChartsMarketCapOptions.options" />
                </div>
            </ChartContainer>
            <ChartContainer v-if="pieChartsSalesOptions" :title="$t('market.sectors.marketCapPerSector')" class="w-1/2">
                <div class="h-72">
                    <Pie :data="pieChartsSalesOptions.data" :options="pieChartsSalesOptions.options" />
                </div>
            </ChartContainer>
        </div>

        <!-- Assets Performance by sector-->
        <div v-if="sectors && sectors.length" class="flex flex-col gap-8 w-full mt-8">
            <!-- Title and Sector Selection -->
            <div class="flex justify-between">
                <SubHeading :title="$t('market.sectors.assetsPerformanceBySector')" />
                <USelectMenu v-model="selectedSector" :options="sectors" class="z-30">
                    <template #label>
                        <span v-if="!selectedSector">{{ $t('market.sectors.selectSector') }}</span>
                        <span v-else class="whitespace-nowrap">{{ selectedSector.label }}</span>
                    </template>
                </USelectMenu>
            </div>

            <AssetsPerformanceCard :asset-data="computedAssetPerformanceData"></AssetsPerformanceCard>
        </div>

        <!-- Top Performing Assets -->
        <div v-if="sectors && sectors.length" class="flex flex-col gap-8 w-full mt-8">
            <SubHeading :title="$t('market.sectors.topPerformingAssets')" />

            <TopPerformingAssetsList :assets-list="topPerformingAssets"></TopPerformingAssetsList>
        </div>
    </PageContainer>
</template>
