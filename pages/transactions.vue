<script lang="ts" setup>
const routes = ref([
    { name: 'transactions.overview', to: '/transactions' },
    { name: 'transactions.details', to: '/transactions/details' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
