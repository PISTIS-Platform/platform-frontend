<script lang="ts" setup>
const routes = ref([
    { name: 'market.store', to: '/market' },
    { name: 'market.log', to: '/market/log' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
