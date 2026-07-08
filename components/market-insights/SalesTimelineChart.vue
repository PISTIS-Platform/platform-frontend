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

import type { MarketInsightTimelinePoint } from '~/interfaces/market-insight-asset-timeline';

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement);

const { t } = useI18n();

const { data } = await useLazyFetch<MarketInsightTimelinePoint[]>('/api/market-insights/timeline');

const chartData = computed(() => {
    const points = data.value ?? [];
    return {
        labels: points.map((point) => point.day),
        datasets: [
            {
                label: t('market.overview.totalSales'),
                data: points.map((point) => point.sales),
                borderColor: '#22c55e',
                backgroundColor: '#22c55e',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
            {
                label: t('market.overview.marketCap'),
                data: points.map((point) => point.amount),
                borderColor: '#6366f1',
                backgroundColor: '#6366f1',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
        legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8 } },
    },
    scales: {
        x: { grid: { display: false }, ticks: { autoSkip: true, maxTicksLimit: 12 } },
        y: { beginAtZero: true, border: { display: false } },
    },
};
</script>

<template>
    <UCard class="w-full">
        <div class="flex flex-col gap-4">
            <p class="font-semibold">{{ t('market.overview.timeline') }}</p>
            <div class="h-80 w-full">
                <Line v-if="data" :data="chartData" :options="chartOptions" />
            </div>
        </div>
    </UCard>
</template>
