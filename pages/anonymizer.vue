<script lang="ts" setup>
import { type Preview } from '~/interfaces/dataset-preview';
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
    const response = await useFetch('/api/anonymizer/preview');
    const data = response.data.value;

    const result: Preview = data.result;
    anonymizerStore.changePreview(result);
});
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
