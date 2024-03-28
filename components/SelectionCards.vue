<script setup lang="ts">
import type CardSelection from '~/interfaces/card-selection';

defineProps({
    selections: {
        type: Array<CardSelection>,
        required: true,
    },
    width: {
        type: String,
        required: false,
        default: 'w-full',
    },
    modelValue: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['update:model-value']);
</script>

<template>
    <div class="flex flex-row gap-4">
        <SelectionCard
            v-for="item in selections"
            :key="item.value"
            :title="item.title"
            :info="item.info"
            :disabled="item.disabled"
            :selected="modelValue === item.value"
            :width="width"
            @click="item.disabled ? '' : emit('update:model-value', item.value)"
        />
    </div>
</template>
