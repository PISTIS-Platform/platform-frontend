<script lang="ts" setup>
const routes = ref([
    { name: 'data.wallet', to: '/data' },
    { name: 'data.log', to: '/data/log' },
    { name: 'data.designer', to: '/data/plan-designer' },
    { name: 'data.dmRepository.title', to: '/data/data-model-reposiroty' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
