<script lang="ts" setup>
import { Preview } from '~/interfaces/dataset-preview';
import { usePreviewStore } from '~/store/preview';

const routes = ref([
    { name: 'anonymizer.anonymizer', to: '/anonymizer' },
    { name: 'anonymizer.obfuscation', to: '/anonymizer/obfuscation' },
    { name: 'anonymizer.kAnonymity', to: '/anonymizer/k-anonymity' },
]);

const previewStore = usePreviewStore();

onMounted(async () => {
    //Initialise data preview for sharing across anonymizer pages
    const response = await useFetch('/api/anonymizer/preview');
    const data = response.data.value;

    const result: Preview = data.result;
    previewStore.changePreview(result);
});
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
