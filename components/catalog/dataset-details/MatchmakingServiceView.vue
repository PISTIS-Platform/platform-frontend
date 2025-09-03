<script setup lang="ts">
import MatchingDatasetDetails from './MatchingDatasetDetails.vue';

const datasetId = '8c1e448b-18c9-48e4-aa6b-4888046cd1a1';
</script>

<template>
    <div class="pb-5">
        <Typography variant="by-heading-4"> {{ $t('matchmakingService.recommendationsHeader') }}</Typography>
    </div>
    <MatchingDatasetDetails :dataset-id="datasetId" />
</template>
