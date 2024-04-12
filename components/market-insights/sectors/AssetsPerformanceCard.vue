<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi';

import type { AssetPerformanceList } from '~/interfaces/market-insights';
import Selection from '~/interfaces/selection';

const props = defineProps({
    assetData: {
        type: Object as PropType<AssetPerformanceList>,
        required: true,
    },
});

//Sort by options
//TODO:: add translations
const sortByOptions: Selection[] = [
    {
        label: 'Total Sales',
        value: 'total_sales',
    },
    {
        label: 'Market Cap',
        value: 'market_cap',
    },
    {
        label: 'Price',
        value: 'price',
    },
    {
        label: 'Percentage Change',
        value: 'percentage_change',
    },
    {
        label: 'Date of acquisition',
        value: 'acquisition_date',
    },
];

const selectedSortByOption = ref<Selection>(sortByOptions[0]);

// Timeframe selection
const assetPerformanceTimeframeBeforeSelection = ref('W');

const computedAssetData = computed(() => {
    if (!props.assetData.top && !props.assetData.worst) {
        return {};
    }

    const selectedSortOption: string = selectedSortByOption.value.value;

    return {
        top: props.assetData.top[selectedSortOption],
        worst: props.assetData.worst[selectedSortOption],
    };
});

//TODO:: filter by TimeframeSelector
</script>

<template>
    <UCard>
        <div class="flex flex-col gap-4 pb-6">
            <!-- selections -->
            <div class="flex justify-end items-center gap-4">
                <TimeframeSelector v-model="assetPerformanceTimeframeBeforeSelection" size="sm"></TimeframeSelector>

                <span class="text-sm ml-2">{{ $t('sortBy') }}:</span>
                <USelectMenu v-model="selectedSortByOption" :options="sortByOptions" class="z-20 w-44">
                    <template #label>
                        <span v-if="!selectedSortByOption">{{ $t('sortBy') }}</span>
                        <span v-else class="whitespace-nowrap">{{ selectedSortByOption.label }}</span>
                    </template>
                </USelectMenu>
            </div>

            <!-- top and worst assets -->
            <div v-if="computedAssetData" class="flex justify-around mt-8 w-full">
                <div class="flex flex-col items-start gap-8">
                    <div
                        v-for="asset in computedAssetData.top"
                        :key="asset.id"
                        class="flex items-center gap-20 xl:gap-44"
                    >
                        <span class="text-2xl font-semibold">{{ asset.name }}</span>
                        <span class="text-xl text-green-500">+ {{ asset.value }}</span>
                    </div>
                </div>
                <UDivider orientation="vertical" class="w-4" />
                <div class="flex flex-col items-start gap-8">
                    <div
                        v-for="asset in computedAssetData.worst"
                        :key="asset.id"
                        class="flex items-center gap-20 xl:gap-44"
                    >
                        <span class="text-2xl font-semibold">{{ asset.name }}</span>
                        <span class="text-xl text-red-500">+ {{ asset.value }}</span>
                    </div>
                </div>
            </div>
        </div>
    </UCard>
</template>
