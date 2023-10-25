<script setup lang="ts">
const props = defineProps({
    selections: {
        type: Array<any>,
        required: true,
    },
    width: {
        type: String,
        required: false,
        default: 'w-full',
    },
    selected: {
        type: String,
        required: true,
    },
});

const innerSelected = computed(() => props.selected);

const emit = defineEmits(['selection-changed']);

watch(innerSelected, () => {
    emit('selection-changed', innerSelected.value);
});
</script>

<template>
    <div class="flex flex-col gap-4 w-full b">
        <SelectionCard
            v-for="item in props.selections"
            :key="item.title"
            :title="item.title"
            :info="item.info"
            :selected="innerSelected === item.title"
            :width="props.width"
            @click="emit('selection-changed', item.title)"
        />
    </div>
</template>
