<script lang="ts" setup>
const routes = ref([
    { name: 'market.store', to: '/market' },
    { name: 'market.log', to: '/market/log' },
    { name: 'market.insights', to: '/market/insights' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
