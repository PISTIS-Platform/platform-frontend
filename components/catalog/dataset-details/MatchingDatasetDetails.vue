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
            class="block border rounded-lg border-pistis-500 p-3 mb-4 hover:bg-pistis-100"
            :to="{
                name: 'my-data-catalog-dataset-details-datasetId',
                params: { datasetId: dataset.dataset_id },
                query: { pm: 'cloud' },
            }"
        >
            <p>
                <strong> {{ dataset.title }} </strong>
            </p>
            <p>{{ dataset.description }}</p>
            <p class="text-pistis-500">{{ dataset.price }}€</p>
            <p>{{ dataset.offer_type }}</p>
        </NuxtLink>
    </div>
</template>
