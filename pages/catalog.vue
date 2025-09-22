<script lang="ts" setup>
const routes = ref([
    { name: 'catalog.title', to: '/catalog?pm=factory' },
    { name: 'data.designer.title', to: '/publish-data' },
    { name: 'data.investmentPlanner.title', to: '/investment-planner' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
