<script setup lang="ts">
defineProps({
    datasetsTransformed: {
        type: Array<{ id: string; title: string; description: string; distributions: Array<Record<string, any>> }>,
        required: true,
    },
});

const emit = defineEmits(['selectDataset']);
</script>

<template>
    <div class="w-full h-full text-gray-700 space-y-8">
        <UCard v-for="dataset in datasetsTransformed" :key="dataset.id">
            <template #header>
                <div class="flex items-center w-full justify-between">
                    <span class="font-bold">{{ dataset.title }}</span>
                    <UButton @click="() => emit('selectDataset', dataset)">{{ $t('select') }}</UButton>
                </div>
            </template>
            <p>
                {{ dataset.description }}
            </p>
        </UCard>
    </div>
</template>
