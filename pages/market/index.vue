<script setup lang="ts">
import { timeframeIntervalSelections } from '~/constants/market-insights';
import { BasicAsset } from '~/interfaces/market-insights';

const selection = ref('W');

const triggerChangeSelection = (value: string) => {
    selection.value = value;
};

const assets: BasicAsset[] = [
    {
        name: 'Asset 1',
        price: 20000,
        change: 4.6,
        data: [13, 56, 34, 20, 34, 45, 60],
    },
    {
        name: 'Asset 2',
        price: 45000,
        change: 9.6,
        data: [13, 56, 34, 20, 34, 45, 60].reverse(),
    },
    {
        name: 'Asset 3',
        price: 90000,
        change: -5.6,
        data: [90, 16, 34, 20, 34, 45, 60],
    },
    {
        name: 'Asset 4',
        price: 90000,
        change: 0,
        data: [13, 56, 34, 20, 34, 45, 60],
    },
];
</script>

<template>
    <PageContainer>
        <RollingAssetsBar :assets="assets" />

        <TimeframeSelector
            :model-value="selection"
            :selections="timeframeIntervalSelections"
            @update:model-value="triggerChangeSelection"
        ></TimeframeSelector>
    </PageContainer>
</template>
