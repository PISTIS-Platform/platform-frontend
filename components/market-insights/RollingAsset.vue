<script setup lang="ts">
import type { BasicAsset } from '~/interfaces/market-insights';

const props = defineProps({
    assetInfo: {
        type: Object as PropType<BasicAsset>,
        required: true,
    },
});

import { PropType } from 'nuxt/dist/app/compat/capi';
</script>

<template>
    <div class="flex justify-between gap-4 items-center">
        <div class="flex flex-col gap-2">
            <span class="text-gray-500 text-sm">{{ props.assetInfo.name }}</span>
            <span class="text-gray-700 text-xl font-bold whitespace-nowrap">{{ props.assetInfo.price }} STC</span>
            <ChangeText :change-value="props.assetInfo.change" />
        </div>

        <!-- timeline graph -->
        <div class="flex items-center justify-center h-16">
            <SimpleLineChart
                class="w-full h-full"
                :data="props.assetInfo.data"
                :change-value="props.assetInfo.change"
            />
        </div>
    </div>
</template>
