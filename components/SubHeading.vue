<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    info: {
        type: String,
        required: false,
        default: '',
    },
});
</script>

<template>
    <span class="flex gap-3 items-center">
        <h3 class="text-base font-semibold">
            {{ props.title }}
        </h3>
        <UTooltip v-if="props.info" :text="props.info">
            <UIcon name="i-formkit-info" class="w-4 h-4" />
        </UTooltip>
    </span>
</template>
