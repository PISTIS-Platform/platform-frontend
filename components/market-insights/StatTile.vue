<script setup lang="ts">
defineProps({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: [String, Number],
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <UCard class="h-full" :ui="{ base: 'flex flex-col', body: { base: 'flex flex-1 flex-col justify-center' } }">
        <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50">
                <UIcon :name="icon" class="h-6 w-6 text-primary-600" />
            </div>
            <div class="flex min-w-0 flex-col gap-1">
                <span class="truncate text-sm text-gray-500">{{ label }}</span>
                <span class="text-2xl font-bold text-gray-700">{{ value }}</span>
            </div>
        </div>
    </UCard>
</template>
