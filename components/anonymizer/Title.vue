<script setup>
const props = defineProps({
    title: {
        type: String,
        default: 'Anonymizer',
    },
});
</script>

<template>
    <div class="w-full mb-10">
        <h1 class="text-2xl">{{ props.title }}</h1>
    </div>
</template>
