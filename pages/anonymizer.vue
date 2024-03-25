<script lang="ts" setup>
const routes = ref([
    { name: 'anonymizer.anonymizer', to: '/anonymizer' },
    { name: 'anonymizer.obfuscation', to: '/anonymizer/obfuscation' },
    { name: 'anonymizer.kAnonymity', to: '/anonymizer/k-anonymity' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
