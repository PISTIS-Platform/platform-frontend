<script lang="ts" setup>
const routes = ref([
    { name: 'data.wallet.title', to: '/data' },
    { name: 'data.log', to: '/data/log' },
    { name: 'data.designer.title', to: '/data/publish-data' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
