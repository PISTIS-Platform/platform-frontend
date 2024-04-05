<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

import type { AssetPerformanceList, BasicSector } from '~/interfaces/market-insights';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

//sector basic info
const {
    data: sectorsBasicInfo,
    pending: loadingSectorsBasicInfo,
    error: sectorsBasicInfoError,
} = await useLazyFetch<BasicSector[]>('/api/market-insights/sectors');

//TODO:: perhaps add watcher for errors (the below won't work with lazy fetch)
if (sectorsBasicInfoError.value) {
    showErrorMessage(t('market.sectors.errorInLoadingBasicInfo'));
}

//Bar chart
const sectorsSalesTimeframeSelection = ref('W');

//TODO:: load from server
const sectorsSales = computed(() => {
    return {
        data: {
            //FIXME:: fix labels based on actual data
            labels: ['January', 'February', 'March', 'April'],
            datasets: [
                {
                    label: 'Dataset 1',
                    data: [1000, 490, 230, 900],
                    backgroundColor: '#ACDC94',
                },
                {
                    label: 'Dataset 2',
                    data: [1000, 490, 230, 900].reverse(),
                    backgroundColor: '#E9A364',
                },
                {
                    label: 'Dataset 3',
                    data: [460, 900, 90, 380],
                    backgroundColor: '#5ABCCF',
                },
            ],
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
const nodeComparisonSelection = ref('Total number of sales by sector vs total');
//TODO:: add translations
const nodeComparisonOptions: string[] = [
    'Total number of sales by sector vs total',
    'Market cap by sector vs total',
    'Compare individual assets',
];

//sectors
const selectedSector = ref<BasicSector | null>(null);

//TODO:: load from server
const sectors = computed(() => {
    if (!sectorsBasicInfo.value) {
        return [];
    }

    return sectorsBasicInfo.value.map((s: BasicSector) => ({
        label: s.label,
        value: s.value,
    }));
});

// Data fetching
//TODO:: add loading for asset performance data
//TODO:: fix return types
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

    console.log({ computedBySectorParentComponent: fetchedAssetsPerformanceData.value[selectedSector.value.value] });

    return fetchedAssetsPerformanceData.value[selectedSector.value.value];
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
            <div v-for="sector in sectorsBasicInfo" v-else :key="sector.value">
                <UCard>
                    <div class="flex flex-col justify-between gap-6">
                        <span class="text-gray-600 text-xl font-bold">{{ sector.label }}</span>
                        <span
                            >{{ $t('market.sectors.changeSince1WeekAgo') }}
                            <ChangeText :change-value="sector.change" class="ml-1" size="xl"
                        /></span>
                    </div>
                </UCard>
            </div>
        </div>

        <!-- Sectors Stacked Bar Chart-->
        <ChartContainer v-if="sectorsSales" :title="$t('market.sectors.allSectorsSales')" class="mt-8">
            <template #right-header>
                <TimeframeSelector
                    is-interval
                    :model-value="sectorsSalesTimeframeSelection"
                    @update:model-value="(value: string) => (sectorsSalesTimeframeSelection = value)"
                ></TimeframeSelector>
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
        <div v-if="sectors.length" class="flex flex-col gap-8 w-full mt-8">
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
    </PageContainer>
</template>
