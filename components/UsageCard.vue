<script setup lang="ts">
import type Selection from '~/interfaces/selection';

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: false,
        default: null,
    },
    percentage: {
        type: Number,
        required: true,
    },
    tooltipInfo: {
        type: Array as PropType<Selection[]>,
        required: false,
        default: () => [],
    },
});

const percentageColorClasses = computed(() => {
    if (props.percentage >= 0 && props.percentage < 50) {
        return 'text-green-600';
    }
    if (props.percentage >= 50 && props.percentage < 90) {
        return 'text-yellow-600';
    }
    return 'text-red-600';
});
</script>

<template>
    <UTooltip
        :prevent="!tooltipInfo.length"
        :class="tooltipInfo.length ? 'cursor-pointer' : ''"
        :ui="{ width: 'max-w-2xl', base: 'text-wrap p-2 h-24' }"
    >
        <div
            class="flex flex-col items-start xl:flex-row xl:justify-between xl:items-center gap-4 w-full rounded-lg ring-gray-200 ring-1 bg-white px-4 py-5 shadow-md sm:py-6"
        >
            <div class="flex items-center gap-2">
                <UIcon v-if="icon" :name="icon" class="h-6 w-6" aria-hidden="true" />
                <dt class="truncate text-sm font-semibold text-gray-500">{{ title }}</dt>
            </div>
            <dd :class="`mt-1 text-2xl font-semibold tracking-tight ${percentageColorClasses}`">{{ percentage }} %</dd>
        </div>
        <template #text>
            <div class="flex flex-col gap-4">
                <p v-for="infoItem in tooltipInfo" :key="infoItem.label">
                    {{ infoItem.label }}: <span class="font-semibold">{{ infoItem.value }}</span>
                </p>
            </div>
        </template>
    </UTooltip>
</template>
