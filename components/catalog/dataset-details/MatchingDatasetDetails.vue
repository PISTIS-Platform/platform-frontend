<script setup lang="ts">
import { ref } from 'vue';

import { getMatchingDatasets } from './MatchmakingService';

const props = defineProps<{
    datasetId: string;
}>();
const matchingDatasets = ref<any[]>([]);

const loadData = async () => {
    try {
        const response = await getMatchingDatasets(props.datasetId);
        matchingDatasets.value = Object.values(response.data).slice(1);
    } catch (error) {
        console.error('Loading data failed:', error);
    }
};

loadData();
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NuxtLink
            v-for="dataset in matchingDatasets"
            :key="dataset.dataset_id"
            class="block border rounded-md border-neutral-300 p-3 hover:bg-pistis-50 hover:border-pistis-300"
            :to="{
                name: 'my-data-catalog-dataset-details-datasetId',
                params: { datasetId: dataset.dataset_id },
                query: { pm: 'cloud' },
            }"
        >
            <div class="flex flex-col space-y-2">
                <div class="flex flex-row justify-between items-start">
                    <div class="font-semibold">{{ dataset.title }}</div>
                    <UBadge
                        variant="subtle"
                        class="capitalize"
                        :color="
                            dataset.offer_type === 'one-ff'
                                ? 'secondary'
                                : dataset.offer_type === 'subscription'
                                  ? 'emerald'
                                  : dataset.offer_type === 'nft'
                                    ? 'blue'
                                    : 'primary'
                        "
                        >{{ dataset.offer_type }}</UBadge
                    >
                </div>
                <div class="text-sm">{{ dataset.description }}</div>
            </div>
        </NuxtLink>
    </div>
</template>
