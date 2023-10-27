<script lang="ts" setup>
const routes = ref([{ name: 'notifications.title', to: '/notifications' }]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <NuxtPage />
    </ShellLayout>
</template>
