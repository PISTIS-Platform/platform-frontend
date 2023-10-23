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
    <div class="flex gap-8">
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
