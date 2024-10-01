<script lang="ts" setup>
const routes = ref([
    { name: 'marketplace.overview', to: '/marketplace' },
    { name: 'marketplace.details', to: '/marketplace/details' },
    { name: 'marketplace.auditor', to: '/marketplace/auditor' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
