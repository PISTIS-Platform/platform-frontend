<script setup lang="ts">
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
import { Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const props = defineProps({
    changeValue: {
        type: Number,
        required: true,
    },
    data: {
        type: Array<number>,
        required: true,
    },
    customOptions: {
        type: Object,
        required: false,
        default: () => {},
    },
});

const simpleLineData = computed(() => ({
    labels: props.data.map(() => ''),
    datasets: [
        {
            label: '',
            data: props.data,
        },
    ],
}));

const simpleLineOptions = computed(() => {
    return {
        responsive: true,
        maintainAspectRatio: true,
        borderColor: props.changeValue > 0 ? 'green' : props.changeValue === 0 ? 'gray' : 'red',
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
        ...props.customOptions,
    };
});
</script>

<template>
    <Line class="w-full h-full" :data="simpleLineData" :options="simpleLineOptions" />
</template>
