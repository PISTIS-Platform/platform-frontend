<script setup lang="ts">
import type { MarketInsightAssetTimeline } from '~/interfaces/market-insight-asset-timeline';

const props = defineProps({
    assets: {
        type: Array<MarketInsightAssetTimeline>,
        required: true,
    },
});

// Only show assets whose series can render a line (needs at least two points).
const renderableAssets = computed(() => props.assets.filter((asset) => asset.series?.length > 1 && asset.amount > 0));
</script>

<template>
    <Marquee
        v-if="renderableAssets.length"
        class="flex items-center justify-around bg-white w-full p-4 rounded-lg border"
        auto-fill
        pause-on-hover
        gradient
        speed="30"
    >
        <AssetSlideCard v-for="asset in renderableAssets" :key="asset.assetId" class="mr-16" :asset="asset" />
    </Marquee>
</template>
