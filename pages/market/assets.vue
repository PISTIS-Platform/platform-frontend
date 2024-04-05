<script lang="ts" setup>
import { BasicAsset } from '~/interfaces/market-insights';
import type Selection from '~/interfaces/selection';

const { t } = useI18n();

// import {
//     ArcElement,
//     BarElement,
//     CategoryScale,
//     Chart as ChartJS,
//     Legend,
//     LinearScale,
//     LineElement,
//     PointElement,
//     Title,
//     Tooltip,
// } from 'chart.js';
// import { Bar, Doughnut, Line } from 'vue-chartjs';

// import { data, lineData, options, pieData } from './chart-data';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const selectedInterval = ref('D');

const triggerIntervalChangeSelection = (value: string) => {
    selectedInterval.value = value;
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

const selectedSector = ref<Selection>(sectors[0]);
</script>

<template>
    <PageContainer>
        <SubHeading :title="$t('market.assets.topPerforming')" />
        <div class="flex mt-6 gap-6 w-full">
            <UCard v-for="asset in assets" :key="asset.name" class="w-full">
                <RollingAsset :asset-info="asset" />
            </UCard>
        </div>
        <ChartContainer :title="$t('market.assets.timeline')" class="mt-6">
            <template #right-header>
                <div class="flex items-center gap-6">
                    <TimeframeSelector
                        :model-value="selectedInterval"
                        is-interval
                        @update:model-value="triggerIntervalChangeSelection"
                    />
                    <USelectMenu
                        v-model="selectedSector"
                        size="md"
                        :options="sectors"
                        value-attribute="value"
                        option-attribute="label"
                    />
                </div>
            </template>
        </ChartContainer>
    </PageContainer>
</template>
