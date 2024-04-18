<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <UCard class="w-full">
        <div class="flex flex-col justify-between gap-4">
            <div class="flex justify-between">
                <SubHeading :title="props.title" />
                <slot name="right-header"></slot>
            </div>

            <slot></slot>
        </div>
    </UCard>
</template>
