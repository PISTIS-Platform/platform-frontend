<script setup lang="ts">
defineProps({
    errorMsg: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <UAlert
        class="p-6 border border-red-200"
        icon="i-heroicons-exclamation-circle"
        :title="errorMsg"
        color="red"
        variant="soft"
    />
    <slot> </slot>
</template>
