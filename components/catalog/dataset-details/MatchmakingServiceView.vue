<script setup lang="ts">
import MatchingDatasetDetails from './MatchingDatasetDetails.vue';

const { datasetId } = defineProps<{
    datasetId: string;
}>();
</script>

<template>
    <div class="pb-5">
        <Typography variant="by-heading-4"> {{ $t('matchmakingService.similarityRecommendations') }}</Typography>
    </div>
    <MatchingDatasetDetails :dataset-id="datasetId" mode="similarityBased" />
</template>
