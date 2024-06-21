<script setup lang="ts">
defineProps({
    completeOrQuery: {
        type: String,
        required: true,
    },
    oneOffPrice: {
        type: Number,
        required: true,
    },
    subscriptionPrice: {
        type: Number,
        required: true,
    },
    selected: {
        type: Object as PropType<{ id: number | string; title: string; description: string }>,
        required: true,
    },
});

//TODO: Include emits for updating the oneOffPrice and subscriptionPrice here when there is an API call
const receivedValuation = ref<boolean>(true);
setInterval(() => {
    receivedValuation.value = false;
}, 10000);
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
            <div v-if="receivedValuation">
                <UProgress animation="carousel" />
            </div>
            <div v-else class="space-y-5">
                <div>
                    {{ $t('data.designer.suggestedOneOff') }}:
                    <span class="font-bold">{{ oneOffPrice }} STC</span>
                </div>
                <div>
                    {{ $t('data.designer.suggestedSubscription') }}:
                    <span class="font-bold">{{ subscriptionPrice }} STC {{ $t('perMonth') }}</span>
                </div>
            </div>
        </UCard>
    </Transition>
</template>
