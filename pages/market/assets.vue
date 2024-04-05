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

const { data: lineChartData, pending: lineChartPending } = useFetch('/market/assets/assets-vs-average');

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
                    <USelectMenu v-model="selectedSector" size="md" :options="sectors"> </USelectMenu>
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
    </PageContainer>
</template>
