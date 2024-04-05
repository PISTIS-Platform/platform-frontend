<script setup lang="ts">
import type { BasicAsset } from '~/interfaces/market-insights';

const props = defineProps({
    assetsList: {
        type: Array<BasicAsset>,
        required: true,
    },
});
</script>

<template>
    <div class="flex gap-16 justify-start items-center w-full">
        <UCard v-for="asset in props.assetsList" :key="asset.id" class="w-full">
            <div class="flex flex-col justify-between gap-6 text-gray-600">
                <span class="text-xl font-bold">{{ asset.name }}</span>
                <div class="flex justify-start items-center h-16">
                    <SimpleLineChart :data="asset.data" :change-value="asset.change" />
                </div>
                <div class="flex justify-between text-xl font-bold">
                    <span>{{ asset.price }} STC</span>
                    <span>{{ asset.salesNum || 0 }} <span class="text-gray-400 text-sm">Sales</span></span>
                </div>
            </div>
        </UCard>
    </div>
</template>
