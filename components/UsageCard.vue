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
    measurement: {
        type: String,
        required: false,
    },
    value: {
        type: Number,
        required: true,
    },
    tooltipInfo: {
        type: Array as PropType<Selection[]>,
        required: false,
        default: () => [],
    },
});
const formatBytes = (bytes: number): { value: number; measurement: string } => {
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;

    if (bytes >= GB) {
        return {
            value: Number((bytes / GB).toFixed(2)),
            measurement: ' GB',
        };
    }
    if (bytes >= MB) {
        return {
            value: Number((bytes / MB).toFixed(2)),
            measurement: ' MB',
        };
    }
    if (bytes >= KB) {
        return {
            value: Number((bytes / KB).toFixed(2)),
            measurement: ' KB',
        };
    }
    return {
        value: Number(bytes.toFixed(2)),
        measurement: ' B',
    };
};

const getMeasurementSymbol = (measurement: string | null | undefined) => {
    if (measurement === 'percent') {
        return '%';
    } else if (measurement === 'bytes') {
        return formatBytes(props.value).measurement;
    } else if (measurement === 'cores') {
        return ' cores';
    } else {
        return '';
    }
};

const percentageColorClasses = computed(() => {
    if (props.value === null) {
        return 'text-gray-600';
    }
    if (props.value >= 0 && props.value < 60) {
        return 'text-green-600';
    }
    if (props.value >= 50 && props.value < 80) {
        return 'text-yellow-600';
    }
    return 'text-red-600';
});

const bytesColorClasses = computed(() => {
    //TODO: Figure out how much is green, yellow or red
    return '';
});

const coresColorClasses = computed(() => {
    //TODO: Figure out how much is green, yellow or red
    return '';
});

const classesComputedMap = computed(() => {
    if (props.measurement === 'percent') {
        return percentageColorClasses.value;
    } else if (props.measurement === 'bytes') {
        return bytesColorClasses.value;
    } else if (props.measurement === 'cores') {
        return coresColorClasses.value;
    }
    return '';
});

const tooltipContent = computed(() => {
    if (props.value === null) {
        return `Service "${props.title}" is not responding.`;
    }
    // Return original tooltipInfo if it exists and percentage is not null
    return props.tooltipInfo.length > 0 ? props.tooltipInfo : null;
});

const shouldPreventTooltip = computed(() => {
    // If percentage is null, always show the tooltip.
    // Otherwise, show it only if there is tooltipInfo.
    return props.value !== null && props.tooltipInfo.length === 0;
});
</script>

<template>
    <UTooltip
        :prevent="shouldPreventTooltip"
        :class="shouldPreventTooltip ? '' : 'cursor-pointer'"
        :ui="{ width: 'max-w-2xl', base: 'text-wrap p-2 h-24' }"
    >
        <div
            class="flex flex-col items-start xl:flex-row xl:justify-between xl:items-center gap-4 w-full rounded-lg ring-gray-200 ring-1 bg-white px-4 py-5 shadow-md sm:py-6"
        >
            <div class="flex items-center gap-2">
                <UIcon v-if="icon" :name="icon" class="h-6 w-6" aria-hidden="true" />
                <dt class="truncate text-sm font-semibold text-gray-500">{{ title }}</dt>
            </div>
            <dd :class="`mt-1 text-2xl font-semibold tracking-tight ${classesComputedMap}`">
                {{ value === null ? 'N/A' : value + getMeasurementSymbol(measurement) }}
            </dd>
        </div>
        <template #text>
            <div class="flex flex-col gap-4">
                <p v-if="value === null">{{ tooltipContent }}</p>
                <p v-for="infoItem in tooltipInfo" v-else :key="infoItem.label">
                    {{ infoItem.label }}: <span class="font-semibold">{{ infoItem.value }}</span>
                </p>
            </div>
        </template>
    </UTooltip>
</template>
