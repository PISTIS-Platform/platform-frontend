<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    info: {
        type: String,
        required: true,
    },
    width: {
        type: String,
        required: false,
        default: 'w-full',
    },
    selected: {
        type: Boolean,
        required: false,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div class="flex-1">
        <UCard
            :class="[
                'relative text-gray-600',
                props.selected ? 'ring-2 ring-primary-500' : '',
                props.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                props.width,
            ]"
        >
            <div :class="['h-10 flex items-center justify-between']">
                <div class="flex flex-col gap-0.5 items-start">
                    <p class="font-semibold">{{ props.title }}</p>
                    <p class="text-sm text-gray-400">{{ props.info }}</p>
                </div>
                <div v-show="props.selected">
                    <UIcon name="i-heroicons-check-circle-20-solid" class="w-6 h-6 text-primary mt-1" />
                </div>
            </div>
        </UCard>
    </div>
</template>
