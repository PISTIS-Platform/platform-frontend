<script lang="ts" setup>
import { type AnonymiserResponse, type UserMetadata } from '~/interfaces/dataset-preview';
import { useAnonymizerStore } from '~/store/anonymizer';

const routes = ref([
    { name: 'anonymizer.anonymizer', to: '/anonymizer' },
    { name: 'anonymizer.obfuscation', to: '/anonymizer/obfuscation' },
    { name: 'anonymizer.kAnonymity', to: '/anonymizer/k-anonymity' },
]);

const anonymizerStore = useAnonymizerStore();

onMounted(async () => {
    //Initialise data preview for sharing across anonymizer pages
    //This is necessary for components to work
    const route = useRoute();
    const queryParams = route.query;

    const catalogueId = queryParams['catalogueId'];
    const distribution = queryParams['distribution'];
    const language = queryParams['language'];

    if (catalogueId && distribution && language) {
        const metadataResponse: AnonymiserResponse<UserMetadata> = (await useFetch('/api/anonymizer/metadata')).data
            .value as AnonymiserResponse<UserMetadata>;

        if (
            metadataResponse.code == 404 ||
            (metadataResponse.result && metadataResponse.result.catalogueId != catalogueId)
        ) {
            const loadDatasetResponse: AnonymiserResponse<undefined> = (
                await useFetch(
                    `/api/anonymizer/dataset/${catalogueId}?distribution=${distribution}&language=${language}`,
                )
            ).data.value as AnonymiserResponse<undefined>;

            if (loadDatasetResponse.code != 200) {
                console.log(loadDatasetResponse);
                window.alert('Failed to fetch dataset from data catalogue! Please try again.');
            }
        }
    }
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
