<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    coin: {
        type: String,
        required: true,
        default: 'STC',
    },
    iconName: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <div class="flex flex-col items-start justify-between space-y-8">
        <div class="flex justify-between items-center w-full space-x-10">
            <h3 class="text-lg font-normal">
                {{ props.title }}
            </h3>
            <UIcon :name="props.iconName" class="w-10 h-10 text-gray-500" />
        </div>

        <div class="text-xl font-bold">{{ props.amount }} {{ props.coin }}</div>
    </div>
</template>
