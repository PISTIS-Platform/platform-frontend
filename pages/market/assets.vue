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

const triggerIntervalChangeSelection = (value: string) => {
    selectedInterval.value = value;
    //TODO: Do something with the change here
};

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

const _triggerSectorChangeSelection = (value: Selection) => {
    selectedSector.value = value;
    //TODO: Do something with the change here
    //selectedSector.value.value -> actual value
};

const lineData = {
    labels: ['January', 'February', 'March', 'April'],
    datasets: [
        {
            label: 'Earnings',
            borderColor: '#7BA3A2',
            backgroundColor: '#7BA3A2',
            data: [20, 12, 11, 39],
        },
        {
            label: 'Costs',
            borderColor: '#4B6C6C',
            backgroundColor: '#4B6C6C',
            data: [11, 20, 12, 39],
        },
    ],
};

const options = {
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
                    <TimeframeSelector
                        :model-value="selectedInterval"
                        is-interval
                        @update:model-value="triggerIntervalChangeSelection"
                    />
                    <USelectMenu v-model="selectedSector" size="md" :options="sectors"> </USelectMenu>
                </div>
            </template>
            <div class="h-72 w-full">
                <Line class="w-full h-full" :data="lineData" :options="options" />
            </div>
        </ChartContainer>
    </PageContainer>
</template>
