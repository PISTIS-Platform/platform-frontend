<script lang="ts" setup>
const routes = ref([
    { name: 'catalog.title', to: '/my-data/catalog' },
    { name: 'data.designer.title', to: '/my-data/publish-data' },
    { name: 'data.investmentPlanner.title', to: '/my-data/investment-planner' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
