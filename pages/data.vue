<script lang="ts" setup>
const routes = ref([
    { name: 'data.jobConfigurator', to: '/data' },
    { name: 'data.streamConfigurator', to: '/data/streaming' },
    { name: 'data.workflowExecution', to: '/data/workflow-execution' },
    { name: 'data.dataTransformation', to: '/data/data-transformation' },
    { name: 'data.insightGenerator', to: '/data/insight-generator' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
