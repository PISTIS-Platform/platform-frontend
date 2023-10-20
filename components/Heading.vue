<template>
    <h1 class="text-lg font-bold">
        {{ props.title }}
    </h1>
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
});
</script>
