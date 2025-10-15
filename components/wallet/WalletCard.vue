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
    coin: {
        type: String,
        required: false,
        default: 'EUR',
    },
    iconName: {
        type: String,
        required: true,
    },
    textColor: {
        type: String,
        required: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});
// Number of digits to show while loading
const digitCount = computed(() => (props.loading ? 4 : 0));
</script>

<template>
    <UCard :ui="{ body: { base: '', padding: 'p-4 sm:p-4' } }">
        <div class="relative flex items-center">
            <div class="flex-shrink-0 mr-4">
                <UIcon :name="props.iconName" class="w-10 h-10 text-secondary-300" />
            </div>
            <div class="min-w-0 flex-1">
                <div class="flex justify-start items-center w-full space-x-2">
                    <h3 class="text-base xl:text-lg font-normal">
                        {{ props.title }}
                    </h3>
                </div>
                <div
                    :class="[
                        'text-lg font-bold',
                        props.amount > 0 ? 'text-green-800' : 'text-red-800',
                        props.textColor,
                    ]"
                >
                    <span v-if="props.loading" class="inline-flex space-x-1.5">
                        <SpinningDigit v-for="i in digitCount" :key="i" :target-digit="1" :duration="2200" />
                        <span>{{ props.coin }}</span>
                    </span>
                    <span v-else> {{ props.amount }} {{ props.coin }} </span>
                </div>
            </div>
        </div>
    </UCard>
</template>
