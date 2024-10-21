<script lang="ts" setup>
const routes = ref([
    { name: 'Data transformation', to: '/data-transformation' },
    { name: 'Data transformation catalog', to: '/data-transformation/catalog' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
