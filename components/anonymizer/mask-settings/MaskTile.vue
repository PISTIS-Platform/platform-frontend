<script setup lang="ts">
const props = defineProps({
    column: {
        type: String,
        default: 'No Column Name!',
    },
});
</script>

<template>
    <div class="flex flex-col max-w-3xl border p-2">
        <h3 class="text-sm">{{ props.column }}</h3>
        <UDropdown></UDropdown>
    </div>
</template>
