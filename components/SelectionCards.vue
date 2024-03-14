<script setup lang="ts">
defineProps({
    selections: {
        type: Array<{ title: string; info: string; disabled: boolean }>,
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
            :key="item.title"
            :title="item.title"
            :info="item.info"
            :disabled="item.disabled"
            :selected="modelValue === item.title"
            :width="width"
            @click="item.disabled ? '' : emit('update:model-value', item.title)"
        />
    </div>
</template>
