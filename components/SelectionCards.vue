<script setup lang="ts">
const props = defineProps({
    selections: {
        type: Array<any>,
        required: true,
    },
    width: {
        type: String,
        required: false,
        default: 'w-52',
    },
});

const selected = ref('');

const emit = defineEmits(['selection-changed']);

watch(selected, () => {
    emit('selection-changed', selected.value);
});
</script>

<template>
    <div class="flex gap-8">
        <SelectionCard
            v-for="item in props.selections"
            :key="item.title"
            :title="item.title"
            :info="item.info"
            :selected="selected === item.title"
            :width="props.width"
            @click="selected = item.title"
        />
    </div>
</template>
