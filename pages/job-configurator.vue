<script lang="ts" setup>
const routes = ref([
    { name: 'Run workflow', to: '/job-configurator' },
    { name: 'Fetch workflow run', to: '/job-configurator/fetch' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
