<script setup lang="ts">
const props = defineProps({
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
});

//TODO: Include emits for updating the oneOffPrice and subscriptionPrice here when there is an API call
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
        <UCard v-if="props.completeOrQuery" class="mt-8 bg-secondary-50 border border-secondary-500">
            <template #header>
                <div class="flex justify-between gap-4 items-start">
                    <SubHeading :title="$t('data.designer.fairTitle')" :info="$t('data.designer.fairInfo')" />
                    <a href="" class="text-xs text-primary-500 underline">{{ $t('learnMore') }}</a>
                </div>
            </template>
            <div>
                <UProgress animation="carousel" />
                <!-- <button type="button" class="bg-indigo-500 ..." disabled> -->
                <!-- <svg class="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
                     ... 
                </svg> -->
                <!-- Processing...
                </button> -->
            </div>
            <div>
                <div>
                    {{ $t('data.designer.suggestedOneOff') }}:
                    <span class="font-bold">{{ props.oneOffPrice }} STC</span>
                </div>
                <div class="mt-4">
                    {{ $t('data.designer.suggestedSubscription') }}:
                    <span class="font-bold">{{ props.subscriptionPrice }} STC {{ $t('perMonth') }}</span>
                </div>
            </div>
        </UCard>
    </Transition>
</template>
