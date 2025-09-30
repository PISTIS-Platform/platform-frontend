<script lang="ts" setup>
const routes = ref([
    { name: 'data.analyticsEngine', to: '/data-analytics' },
    { name: 'data.mlModelEditor', to: '/data-analytics/ml-model-editor' },
]);
</script>

<template>
    <ShellLayoutIframe :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayoutIframe>
</template>
