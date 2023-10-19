<script lang="ts" setup>
const routes = ref([
    { name: 'data.wallet', to: '/data' },
    { name: 'data.log', to: '/data/log' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
