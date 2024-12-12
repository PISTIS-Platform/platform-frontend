<script setup lang="ts">
import PreviewTable from '~/components/anonymizer/PreviewTable.vue';
import { useAnonymizerStore } from '~/store/anonymizer';

import Title from '../../components/anonymizer/Title.vue';

/**
 * Trigger for the Replace Data button loading animation.
 */
const isLoading: Ref<boolean> = ref(false);

/**
 * Reference to the anonymiser pinia store.
 */
const anonymizerStore = useAnonymizerStore();

/**
 * Make a call to the anonymiser API to generate synthetic data. Will redirect to home upon successful request.
 */
async function generateData() {
    isLoading.value = true;
    const response = await useFetch('/api/anonymizer/dataset/synthetic-data', {
        method: 'PUT',
    });
    const data = response.data.value;

    if (data) {
        if (data.code === 200) {
            window.alert('Synthetic data successfully generated!');
            await anonymizerStore.fetchPreview();

            // Navigating home instead of refreshing reportConfig
            navigateTo('/anonymizer');
        } else {
            window.alert(`Something went wrong! Error: ${data.error}`);
        }
    }
    isLoading.value = false;
}
</script>

<template>
    <Title title="Synthetic Data" />
    <div class="flex flex-row flex-wrap justify-between gap-1">
        <UCard class="w-full">
            <Title title="Data Preview" />
            <PreviewTable class="mb-3" />
            <template v-if="anonymizerStore.getPreviewFetchCode === 200">
                <Title title="Generate Synthetic Data" />
                <p>
                    Upon pressing the button below synthetic data will be generated and replace your original dataset.
                </p>
                <UButton class="mt-3" :loading="isLoading" @click="generateData()">Replace Data</UButton>
            </template>
        </UCard>
    </div>
</template>
