<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

import type {
    AssetPerformanceList,
    BasicAsset,
    BasicSector,
    SectorSalesByTimeframe,
} from '~/interfaces/market-insights';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

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
const nodeComparisonOptions = [
    t('market.sectors.salesBySectorVsTotal'),
    t('market.sectors.marketCapBySectorVsTotal'),
    t('market.sectors.assetsComparison'),
];
const nodeComparisonSelection = ref(nodeComparisonOptions[0]);

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
        <div class="flex gap-8 justify-start items-center mt-8 w-full">
            <div v-if="loadingSectorsBasicInfo" class="flex justify-start w-full gap-8">
                <USkeleton
                    v-for="item in new Array(3)"
                    :key="item"
                    :ui="{ background: 'bg-gray-300' }"
                    class="h-24 w-72"
                />
            </div>
            <div v-for="sector in sectors" v-else :key="sector.value">
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
        <ChartContainer v-if="sectorsSales" :title="$t('market.sectors.movingAverages')" class="mt-8">
            <template #right-header>
                <USelectMenu
                    :model-value="nodeComparisonSelection"
                    :options="nodeComparisonOptions"
                    @update:model-value="(value: string) => (nodeComparisonSelection = value)"
                >
                    <template #option="{ option }">
                        <span>{{ option }}</span>
                    </template>
                </USelectMenu>
            </template>

            <div class="h-52"></div>
        </ChartContainer>

        <!-- Pie chart and right chart -->
        <div class="flex justify-between items-center gap-6 mt-8 w-full">
            <ChartContainer v-if="sectorsSales" :title="$t('market.sectors.sectorsVsTotalMarketCap')" class="w-1/2">
                <div class="h-52"></div>
            </ChartContainer>
            <ChartContainer v-if="sectorsSales" :title="$t('market.sectors.sectorsVsTotalMarketCap')" class="w-1/2">
                <div class="h-52"></div>
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
