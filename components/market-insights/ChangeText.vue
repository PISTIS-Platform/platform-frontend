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

const colorIndicator = computed(() => {
    if (props.changeValue > 0) {
        return 'green';
    }

    if (props.changeValue < 0) {
        return 'red';
    }

    return 'gray';
});
</script>

<template>
    <span
        :class="[
            `font-semibold text-${props.size} text-${colorIndicator}-600`,
            props.mode === 'rounded' ? `px-2 py-1 rounded-lg bg-${colorIndicator}-200` : '',
        ]"
        >{{ `${props.changeValue > 0 ? '+' : ''}${props.changeValue}%` }}
    </span>
</template>
