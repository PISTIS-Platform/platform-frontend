<script setup lang="ts">
const props = defineProps({
    changeValue: {
        type: Number,
        required: true,
    },
    size: {
        type: String,
        default: 'md',
    },
    mode: {
        type: String,
        default: 'text',
    },
});

const textSize = computed(() => `text-${props.size}`);

const textColor = computed(() => {
    return props.changeValue > 0 ? 'text-green-600' : props.changeValue < 0 ? 'text-red-600' : 'text-gray-600';
});

const bgColor = computed(() => {
    return props.changeValue > 0 ? 'bg-green-100' : props.changeValue < 0 ? 'bg-red-100' : 'bg-gray-100';
});
</script>

<template>
    <span
        :class="[
            `font-semibold`,
            textSize,
            textColor,
            props.mode === 'rounded' ? `px-2 py-1 rounded-lg ${bgColor}` : '',
        ]"
        >{{ `${props.changeValue > 0 ? '+' : ''}${props.changeValue}%` }}
    </span>
</template>
