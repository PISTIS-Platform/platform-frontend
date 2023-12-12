<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
});
</script>

<template>
    <UCard :ui="{ body: { base: '', padding: 'p-4 sm:p-4' } }">
        <div class="relative flex items-center">
            <div class="min-w-0 flex-1">
                <div class="flex items-center w-full space-x-2">
                    <h3 class="text-base xl:text-lg font-normal">
                        {{ props.title }}
                    </h3>
                </div>
                <div :class="['text-lg font-bold', props.title === 'Total' ? 'text-green-800' : 'text-gray-800']">
                    {{ props.amount }}
                </div>
            </div>
        </div>
    </UCard>
</template>
