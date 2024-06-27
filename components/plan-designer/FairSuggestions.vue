<script setup lang="ts">
defineProps({
    completeOrQuery: {
        type: String,
        required: true,
    },
    modelValue: {
        type: Object as PropType<{
            totalRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
            dataQuality: number;
            technical: number;
            business: number;
            legal: number;
            privacy: number;
        }>,
    },
    selected: {
        type: Object as PropType<{ id: number | string; title: string; description: string }>,
        required: true,
    },
    loadingValuation: {
        type: Boolean,
        required: true,
    },
});

//TODO: Include emits for updating the oneOffPrice and subscriptionPrice here when there is an API call
// setInterval(() => {
//     receivedValuation.value = false;
// }, 10000);
</script>

<template>
    <Transition
        enter-active-class="duration-300 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
    >
        <UCard v-if="completeOrQuery && selected.title" class="bg-secondary-50 border border-secondary-500">
            <template #header>
                <div class="flex justify-between gap-4 items-start">
                    <SubHeading :title="$t('data.designer.fairTitle')" :info="$t('data.designer.fairInfo')" />
                    <a href="" class="text-xs text-primary-500 underline">{{ $t('learnMore') }}</a>
                </div>
            </template>
            <div v-if="loadingValuation">
                <UProgress animation="carousel" />
            </div>
            <div v-else class="space-y-5">
                <!-- <div>
                    {{ $t('data.designer.suggestedOneOff') }}:
                    <span class="font-bold">{{ oneOffPrice }} STC</span>
                </div> -->
            </div>
        </UCard>
    </Transition>
</template>
