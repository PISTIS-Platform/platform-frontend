<script setup>
import { onMounted, ref } from 'vue';

import { navigateTo, useRoute } from '#imports';

const route = useRoute();
const config = useRuntimeConfig();

const id = route.params.id;
const factoryUrl = config.public.factoryUrl;
const cloudUrl = config.public.cloudUrl;

const pistisMode = ref('');

onMounted(() => {
    const currentUrl = window.location.href;

    if (currentUrl.startsWith(factoryUrl)) {
        pistisMode.value = 'factory';
        navigateTo(`${factoryUrl}/catalog/dataset-details/${id}?pm=${pistisMode.value}`, { external: true });
    } else if (currentUrl.startsWith(cloudUrl)) {
        pistisMode.value = 'cloud';
        navigateTo(`${factoryUrl}/marketplace/dataset-details/${id}?pm=${pistisMode.value}`, { external: true });
    } else {
        pistisMode.value = '';
        navigateTo(`/`);
    }
});
</script>

<template>
    <p>Redirecting...</p>
</template>
