<script setup lang="ts">
import { BasicAsset } from '~/interfaces/market-insights';
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
</script>

<template>
    <PageContainer>
        <SubHeading title="Top Performing Assets" />
        <div class="flex mt-6 gap-4 w-full">
            <UCard v-for="asset in assets" :key="asset.name" class="w-full">
                <RollingAsset :asset-info="asset" />
            </UCard>
        </div>
    </PageContainer>
</template>
