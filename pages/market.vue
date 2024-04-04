<script lang="ts" setup>
const routes = ref([
    { name: 'market.overview', to: '/market' },
    { name: 'market.assets', to: '/market/assets' },
    { name: 'market.sectors.title', to: '/market/sectors' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
