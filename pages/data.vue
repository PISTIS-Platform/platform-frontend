<script lang="ts" setup>
const routes = ref([
    { name: 'data.jobConfigurator', to: '/data' },
    { name: 'data.streamingConfigurator', to: '/data/streaming' },
    { name: 'data.workflowExecution', to: '/data/workflow-execution' },
    { name: 'data.dataTransformation', to: '/data/data-transformation' },
    { name: 'data.transformationCatalogue', to: '/data/transformation-catalogue' },
    { name: 'data.insightGenerator', to: '/data/insight-generator' },
    // { name: 'data.anonymizer', to: '/data/anonymizer' },
    // { name: 'data.designer.title', to: '/data/publish-data' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col justify-start">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
