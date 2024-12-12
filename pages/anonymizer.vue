<script lang="ts" setup>
import { type AnonymiserResponse, type UserMetadata } from '~/interfaces/dataset-preview';
import { useAnonymizerStore } from '~/store/anonymizer';

/**
 * Routes available on the anonymiser page.
 */
const routes = ref([
    { name: 'anonymizer.anonymizer', to: '/anonymizer' },
    { name: 'anonymizer.obfuscation', to: '/anonymizer/obfuscation' },
    { name: 'anonymizer.kAnonymity', to: '/anonymizer/k-anonymity' },
    { name: 'Synthetic Data', to: '/anonymizer/synth' },
]);

/**
 * Reference to the anonymiser pinia store.
 */
const anonymizerStore = useAnonymizerStore();

/**
 * Fetch dataset preview on mount.
 */
onMounted(async () => {
    /**
     * Reference to the current route.
     */
    const route = useRoute();

    /**
     * Query parameters available on the current route.
     */
    const queryParams = route.query;

    /**
     * UUID of the dataset in the factory data catalogue.
     */
    const datasetId = queryParams['datasetId'];

    /**
     * UUID of the dataset distribution
     */
    const distribution = queryParams['distribution'];

    /**
     * Language of the distribution title
     */
    const language = queryParams['language'];

    // If datasetId, distribution and language are defined
    if (datasetId && distribution && language) {
        // Attempt to fetch metadata on a currently loaded dataset
        const metadataResponse: AnonymiserResponse<UserMetadata> = (await useFetch('/api/anonymizer/metadata')).data
            .value as AnonymiserResponse<UserMetadata>;

        // If there is no metadata
        if (
            metadataResponse.code == 404 ||
            (metadataResponse.result && metadataResponse.result.catalogueId != datasetId)
        ) {
            // Load the dataset from the factory data catalogue
            const loadDatasetResponse: AnonymiserResponse<undefined> = (
                await useFetch(`/api/anonymizer/dataset/${datasetId}?distribution=${distribution}&language=${language}`)
            ).data.value as AnonymiserResponse<undefined>;

            if (loadDatasetResponse.code != 200) {
                window.alert('Failed to fetch dataset from data catalogue! Please try again.');
            }
        }
    }
    // Fetch the preview from the anonymiser
    await anonymizerStore.fetchPreview();
});
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
