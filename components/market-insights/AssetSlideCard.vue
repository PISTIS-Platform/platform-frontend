<script setup lang="ts">
import type { MarketInsightAssetTimeline } from '~/interfaces/market-insight-asset-timeline';

const props = defineProps({
    asset: {
        type: Object as PropType<MarketInsightAssetTimeline>,
        required: true,
    },
});

// Backend changePct is a ratio (e.g. -0.5); display it as a rounded percentage.
const changePercent = computed(() =>
    props.asset.changePct === null ? null : Math.round(props.asset.changePct * 1000) / 10,
);

const changeColor = computed(() => {
    if (changePercent.value === null || changePercent.value === 0) return 'text-gray-500';
    return changePercent.value > 0 ? 'text-green-600' : 'text-red-600';
});

// Sparkline plots the per-day number of sales.
const salesSeries = computed(() => props.asset.series.map((point) => point.sales));
</script>

<template>
    <div class="flex justify-between gap-4 items-center">
        <div class="flex flex-col gap-2 max-w-48">
            <span class="text-gray-500 text-sm truncate" :title="asset.assetName">{{ asset.assetName }}</span>
            <span class="text-gray-700 text-xl font-bold whitespace-nowrap">{{ asset.amount }} PSTC</span>
            <span :class="['font-semibold', changeColor]">
                <template v-if="changePercent === null">—</template>
                <template v-else>{{ changePercent > 0 ? '+' : '' }}{{ changePercent }}%</template>
            </span>
        </div>

        <div class="flex items-center justify-center h-16 w-32">
            <AssetSparkline class="w-full h-full" :data="salesSeries" :change-value="asset.changePct ?? 0" />
        </div>
    </div>
</template>
