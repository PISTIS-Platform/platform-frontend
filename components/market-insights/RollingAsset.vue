<script setup lang="ts">
import type { BasicAsset } from '~/interfaces/market-insights';

const props = defineProps({
    assetInfo: {
        type: Object as PropType<BasicAsset>,
        required: true,
    },
});

import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { PropType } from 'nuxt/dist/app/compat/capi';
import { Line } from 'vue-chartjs';

const lineData = {
    //FIXME:: fix labels based on actual data
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'],
    datasets: [
        {
            label: 'Sales',
            data: props.assetInfo.data,
        },
    ],
};

const options = {
    responsive: true,
    maintainAspectRatio: true,
    borderColor: props.assetInfo.change > 0 ? 'green' : props.assetInfo.change === 0 ? 'gray' : 'red',
    pointBorderWidth: 0,
    pointRadius: 0,
    pointHoverRadius: 0,
    scales: {
        y: {
            display: false,
        },
        x: {
            display: false,
        },
    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            enabled: false,
        },
    },
};

const assetChangeText = computed(() => {
    if (props.assetInfo.change > 0) {
        return `+${props.assetInfo.change}%`;
    }

    return `${props.assetInfo.change}%`;
});

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);
</script>

<template>
    <div class="flex justify-between gap-2 items-center">
        <div class="flex flex-col gap-2">
            <span class="text-gray-500 text-sm">{{ props.assetInfo.name }}</span>
            <span class="text-gray-700 text-xl font-bold">{{ props.assetInfo.price }} STC</span>
            <span
                :class="[
                    'font-semibold',
                    props.assetInfo.change > 0
                        ? 'text-green-600'
                        : props.assetInfo.change === 0
                        ? 'text-gray-600'
                        : 'text-red-600',
                ]"
                >{{ assetChangeText }}
            </span>
        </div>
        <!-- timeline graph -->
        <div class="flex items-center justify-center h-16">
            <Line class="w-full h-full" :data="lineData" :options="options" />
        </div>
    </div>
</template>
