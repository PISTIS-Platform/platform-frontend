<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <h1 class="text-2xl font-bold">
        {{ props.title }}
    </h1>
</template>
