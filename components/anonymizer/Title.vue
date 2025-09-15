<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: 'Anonymizer',
    },
});
</script>

<template>
    <!--Displays the title passed in the props-->
    <div class="w-full mb-10">
        <h1 class="text-2xl">{{ props.title }}</h1>
    </div>
</template>
