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
});

const assetChangeText = computed(() => {
    if (props.changeValue > 0) {
        return `+${props.changeValue}%`;
    }

    return `${props.changeValue}%`;
});
</script>

<template>
    <span
        :class="[
            `font-semibold text-${props.size}`,
            props.changeValue > 0 ? 'text-green-600' : props.changeValue === 0 ? 'text-gray-600' : 'text-red-600',
        ]"
        >{{ assetChangeText }}
    </span>
</template>
