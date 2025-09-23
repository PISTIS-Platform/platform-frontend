<script setup lang="ts">
const config = useRuntimeConfig();
</script>

<template>
    <iframe
        :src="`${config.public.factoryUrl}/srv/analytics-engine`"
        title="Analytics Engine"
        width="100%"
        height="100%"
        frameborder="0"
    ></iframe>
</template>
