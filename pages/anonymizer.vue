<script lang="ts" setup>
import { usePreviewStore } from '~/store/preview';

import { formatPreview } from './anonymizer/data';

const routes = ref([
    { name: 'anonymizer.anonymizer', to: '/anonymizer' },
    { name: 'anonymizer.obfuscation', to: '/anonymizer/obfuscation' },
    { name: 'anonymizer.kAnonymity', to: '/anonymizer/k-anonymity' },
]);

const previewStore = usePreviewStore();

onMounted(async () => {
    const response = await useFetch('/api/anonymizer/preview');
    const data = response.data.value;

    const result = data.result;
    previewStore.changeDataset(result.dataset);
    previewStore.changeMetadata(result.metadata);
    previewStore.changeReport(result.report);
    previewStore.changeTableRows(formatPreview(previewStore.getDataset));
});
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
