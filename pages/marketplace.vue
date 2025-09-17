<script lang="ts" setup>
const routes = ref([
    { name: 'marketplace.pistisMarketplace', to: '/marketplace?pm=cloud' },
    { name: 'market.market', to: '/marketplace/market-insights' },
    { name: 'data.usage.analytics', to: '/marketplace/usage-analytics' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
