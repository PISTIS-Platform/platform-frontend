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
    <div class="flex items-center gap-12 bg-white w-full p-4 rounded-md border">
        <Marquee>
            <RollingAsset v-for="asset in assets" :key="asset.name" :asset-info="asset" />
        </Marquee>
    </div>
</template>
