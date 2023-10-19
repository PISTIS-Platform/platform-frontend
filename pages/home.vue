<script lang="ts" setup>
const routes = ref([
    { name: 'home.dashboard', to: '/home' },
    { name: 'home.analytics', to: '/home/analytics' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
