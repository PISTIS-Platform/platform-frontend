<script setup lang="ts">
import { computed } from 'vue';

import { useDataTruncator } from '@/composables/useDataTruncator';
import PhArrowDown from '~icons/ph/arrow-down';
import PhArrowUp from '~icons/ph/arrow-up';

const props = defineProps<{
    data: any[] | string;
}>();

const expanded = defineModel<boolean>('expanded', { default: true });
const limit = defineModel<number>('limit', { default: Number.POSITIVE_INFINITY });

const { data: truncated, toggle } = useDataTruncator({
    data: props.data as any[],
    limit,
});

const isExpanded = computed(() => expanded.value);

function handleToggle() {
    expanded.value = !expanded.value;
    toggle();
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <slot :truncated="truncated" :is-expanded="isExpanded">
            {{ truncated }}
        </slot>
        <span class="by-link cursor-pointer">
            <button
                class="inline-flex min-w-fit flex-row items-center gap-2 cursor-pointer text-pistis-600"
                @click="handleToggle"
            >
                <slot name="label" :is-expanded="isExpanded"
                    ><span>{{ isExpanded ? 'Show less' : 'Show more' }}</span></slot
                >
                <component :is="isExpanded === true ? PhArrowUp : PhArrowDown" class="mr-2 text-pistis-600 !text-xs" />
            </button>
        </span>
    </div>
</template>
