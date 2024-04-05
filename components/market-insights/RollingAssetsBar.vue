<script setup lang="ts">
import type { BasicAsset } from '~/interfaces/market-insights';

defineProps({
    assets: {
        type: Array<BasicAsset>,
        required: true,
    },
});
</script>

<template>
    <Marquee
        class="flex items-center justify-around bg-white w-full p-4 rounded-lg border"
        auto-fill
        pause-on-hover
        gradient
        speed="30"
    >
        <RollingAsset v-for="asset in assets" :key="asset.name" class="mr-16" :asset-info="asset" />
    </Marquee>
</template>
