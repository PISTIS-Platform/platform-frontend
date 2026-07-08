<script setup lang="ts">
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

const props = defineProps({
    // Value points to plot (e.g. per-day number of sales).
    data: {
        type: Array<number>,
        required: true,
    },
    // Drives the line color: green (up), red (down), gray (flat/unknown).
    changeValue: {
        type: Number,
        default: 0,
    },
});

const chartData = computed(() => ({
    labels: props.data.map(() => ''),
    datasets: [
        {
            label: '',
            data: props.data,
            tension: 0.4,
        },
    ],
}));

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    borderColor: props.changeValue > 0 ? 'green' : props.changeValue < 0 ? 'red' : 'gray',
    pointBorderWidth: 0,
    pointRadius: 0,
    pointHoverRadius: 0,
    scales: {
        y: { display: false },
        x: { display: false },
    },
    plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
    },
}));
</script>

<template>
    <Line class="w-full h-full" :data="chartData" :options="chartOptions" />
</template>
