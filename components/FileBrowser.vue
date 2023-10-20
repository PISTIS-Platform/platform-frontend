<template>
    <UCard>
        <div class="w-full flex flex-row flex-wrap gap-y-4 gap-x-2 overflow-y-auto h-96">
            <div
                v-for="file in files"
                :key="file"
                :class="[
                    'w-20 flex flex-col justify-center items-center cursor-pointer',
                    file === innerSelected ? 'bg-gray-200' : '',
                ]"
                @click="innerSelected = file"
            >
                <UIcon name="i-heroicons-document" class="w-20 h-20 text-gray-500" />
                <p class="text-xs text-gray-600">{{ file }}</p>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps({
    files: {
        type: Array<string>,
        required: true,
    },
    selected: {
        type: String,
        required: true,
    },
});

const innerSelected = ref(props.selected);

const emit = defineEmits(['selectionChanged']);

watch(innerSelected, () => {
    emit('selectionChanged', innerSelected.value);
});
</script>
