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
        default: 'w-52',
    },
    selected: {
        type: Boolean,
        required: false,
        default: false,
    },
});
</script>

<template>
    <div>
        <UCard :class="['relative text-gray-600', props.selected ? 'bg-primary-500 text-white' : '', props.width]">
            <div :class="['h-14 cursor-pointer flex items-center justify-center']">
                <p class="font-semibold">{{ props.title }}</p>
                <UIcon name="i-formkit-info" class="w-4 h-4 absolute top-1 right-1" />
            </div>
        </UCard>
    </div>
</template>
