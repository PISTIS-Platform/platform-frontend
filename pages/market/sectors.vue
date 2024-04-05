<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

import { timeframeBeforeSelections, timeframeIntervalSelections } from '~/constants/market-insights';
import type { BasicSector } from '~/interfaces/market-insights';

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
const selectedSector = ref('');

//TODO:: load from server
const sectors = computed(() => {
    if (!sectorsBasicInfo.value) {
        return [];
    }

    return sectorsBasicInfo.value.map((s: BasicSector) => s.name);
});

//Assets performance by sector
const selectedSortByOption = ref('');
const sortByOptions = ['Total Sales', 'Market Cap', 'Price', '% change since D/W/M/Y ago', 'Date of acquisition'];

const assetPerformanceTimeframeBeforeSelection = ref('W');
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
            <div v-for="sector in sectorsBasicInfo" v-else :key="sector.name">
                <UCard>
                    <div class="flex flex-col justify-between gap-6">
                        <span class="text-gray-600 text-xl font-bold">{{ sector.name }}</span>
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
                    :model-value="sectorsSalesTimeframeSelection"
                    :selections="timeframeIntervalSelections"
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
                    size="md"
                    @update:model-value="(value: string) => (nodeComparisonSelection = value)"
                >
                    <!-- including this wraps the text if it's too big -->
                    <template #option="{ option }">
                        {{ option }}
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
                        <span v-else>{{ selectedSector }}</span>
                    </template>
                </USelectMenu>
            </div>

            <UCard>
                <div class="flex justify-end gap-4">
                    <TimeframeSelector
                        v-model="assetPerformanceTimeframeBeforeSelection"
                        size="sm"
                        :selections="timeframeBeforeSelections"
                    ></TimeframeSelector>
                    <USelectMenu v-model="selectedSortByOption" :options="sortByOptions" class="z-20 w-64">
                        <template #label>
                            <span v-if="!selectedSortByOption">{{ $t('sortBy') }}</span>
                            <span v-else>{{ selectedSortByOption }}</span>
                        </template>
                    </USelectMenu>
                </div>

                <div class="mt-8 h-96">Asset1</div>
            </UCard>
        </div>
    </PageContainer>
</template>
