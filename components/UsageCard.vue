<script setup lang="ts">
defineProps({
    name: {
        type: String,
        required: true,
    },

    value: {
        type: Number,
        default: () => undefined,
    },
    unit: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    tooltip: {
        type: String,
        required: false,
        default: () => '',
    },
    additionalClasses: {
        type: String,
        required: false,
        default: () => '',
    },
});
</script>

<template>
    <div
        class="flex flex-col items-start xl:flex-row xl:justify-between xl:items-center gap-4 w-full rounded-lg ring-gray-200 ring-1 bg-white px-4 py-5 shadow-md sm:py-6"
    >
        <div class="flex items-center gap-2">
            <UIcon v-if="icon" :name="icon" class="h-6 w-6" aria-hidden="true" />
            <dt class="truncate text-sm font-semibold text-gray-500">{{ name }}</dt>
        </div>
        <UTooltip :text="`${tooltip}`">
            <dd :class="`mt-1 font-semibold tracking-tight`">
                <span :class="`text-2xl ${additionalClasses}`">{{ value }}</span>
                <span class="text-gray-500 text-lg ml-1">{{ unit }}</span>
            </dd>
        </UTooltip>
    </div>
</template>
