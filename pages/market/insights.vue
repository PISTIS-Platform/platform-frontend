<script setup lang="ts">
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'vue-chartjs';

import { data, lineData, options, pieData } from './chart-data';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);
</script>

<template>
    <Transition
        enter-active-class="duration-300 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
    >
        <UCard class="w-full h-full">
            <template #header>
                <SubHeading :title="$t('market.insights')" />
            </template>
            <div class="flex flex-col gap-4">
                <h3>Weekly Sales</h3>
                <div class="flex flex-row w-full">
                    <Bar class="w-full h-full" :data="data" :options="options" />
                </div>
                <div class="flex flex-row w-full mt-8">
                    <div class="w-1/2 h-full">
                        <h3>Sales Performance</h3>
                        <Line class="w-full h-full" :data="lineData" :options="options" />
                    </div>
                    <div class="w-1/2 h-1/2">
                        <h3>Types</h3>
                        <Doughnut class="w-full h-full" :data="pieData" :options="options" />
                    </div>
                </div>
            </div>
        </UCard>
    </Transition>
</template>
