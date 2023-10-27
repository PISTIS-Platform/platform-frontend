<script setup lang="ts">
const props = defineProps({
    selections: {
        type: Array<{ title: string; info: string }>,
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
    <div class="flex flex-col gap-4 w-full b">
        <SelectionCard
            v-for="item in props.selections"
            :key="item.title"
            :title="item.title"
            :info="item.info"
            :selected="props.modelValue === item.title"
            :width="props.width"
            @click="emit('update:model-value', item.title)"
        />
    </div>
</template>
