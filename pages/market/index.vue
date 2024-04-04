<script setup lang="ts">
import { timeframeIntervalSelections } from '~/constants/market-insights';

const selection = ref('W');

const triggerChangeSelection = (value: string) => {
    selection.value = value;
};
</script>

<template>
    <PageContainer>
        <TimeframeSelector
            :model-value="selection"
            :selections="timeframeIntervalSelections"
            @update:model-value="triggerChangeSelection"
        ></TimeframeSelector>
    </PageContainer>
</template>
