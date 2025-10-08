<template>
    <div :class="bubbleClasses">
        <slot />
    </div>
</template>

<script setup>
const props = defineProps({
    class: {
        type: String,
        default: '',
    },
});

const bubbleClasses = computed(() => {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center';

    const statusClasses = {
        inactive: 'bg-gray-200 text-gray-600',
        error: 'bg-red-100 text-red-600',
        success: 'bg-green-100 text-green-600',
    };

    const statusClass = Object.keys(statusClasses).find((key) => props.class.includes(key));

    return [baseClasses, statusClass ? statusClasses[statusClass] : '', props.class].filter(Boolean).join(' ');
});
</script>
