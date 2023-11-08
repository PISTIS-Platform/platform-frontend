<script setup lang="ts">
defineProps({
    files: {
        type: Array<string>,
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
    <UCard class="bg-primary-50 bg-opacity-30 overflow-y-auto">
        <div class="w-full h-96">
            <div class="w-full flex flex-row flex-wrap gap-y-5 gap-x-2 lg:gap-x-7 max-h-96 items-start">
                <div
                    v-for="file in files"
                    :key="file"
                    :class="[
                        'w-24 flex flex-col gap-2 justify-center items-center cursor-pointer p-2 rounded-xl border-2 border-primary-500 border-opacity-0',
                        file === modelValue ? 'bg-primary-50 border-opacity-100' : 'border-opacity-0',
                    ]"
                    @click="emit('update:model-value', file)"
                >
                    <UIcon name="i-fa6-regular-file-lines" class="w-16 h-16 text-gray-500" />
                    <p class="text-xs text-gray-600">{{ file }}</p>
                </div>
            </div>
        </div>
    </UCard>
</template>
