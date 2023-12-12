<script lang="ts" setup>
const routes = ref([
    { name: 'data.wallet.title', to: '/data' },
    { name: 'data.log', to: '/data/log' },
    { name: 'data.dmRepository.title', to: '/data/data-model-repository' },
    { name: 'data.designer.title', to: '/data/plan-designer' },
    { name: 'data.usage.title', to: '/data/data-usage' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
