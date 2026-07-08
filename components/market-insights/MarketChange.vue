<script setup lang="ts">
// Renders a backend change ratio (e.g. -0.2) as a signed, colored percentage.
const props = defineProps<{ change: number | null }>();

const percent = computed(() => (props.change == null ? null : Math.round(props.change * 1000) / 10));

const color = computed(() => {
    if (percent.value === null || percent.value === 0) return 'text-gray-500';
    return percent.value > 0 ? 'text-green-600' : 'text-red-600';
});
</script>

<template>
    <span :class="['font-semibold', color]">
        <template v-if="percent === null">—</template>
        <template v-else>{{ percent > 0 ? '+' : '' }}{{ percent }}%</template>
    </span>
</template>
