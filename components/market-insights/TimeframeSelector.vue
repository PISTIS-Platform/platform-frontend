<script setup lang="ts">
import type TimeframeSelection from '~/interfaces/timeframe-selection';

defineProps({
    selections: {
        type: Array<TimeframeSelection>,
        required: true,
    },
    modelValue: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['update:model-value']);
</script>

<template>
    <UButtonGroup size="md" orientation="horizontal">
        <UButton
            v-for="item in selections"
            :key="item.value"
            :label="item.label"
            color="white"
            :class="[
                'relative text-gray-600 hover:bg-primary-100',
                modelValue === item.value ? 'text-white bg-primary-500 hover:bg-primary-500 hover:text-white' : '',
                item.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
            ]"
            @click="item.disabled ? '' : emit('update:model-value', item.value)"
        />
    </UButtonGroup>
</template>
