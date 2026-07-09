<script setup lang="ts">
import type { MarketInsightSalesVolume } from '~/interfaces/market-insight-overview';

const props = defineProps({
    salesVolume: {
        type: Object as PropType<MarketInsightSalesVolume>,
        required: true,
    },
});

const { t } = useI18n();

const rows = computed(() => [
    {
        label: t('market.overview.increase'),
        value: props.salesVolume.increasing,
        icon: 'i-heroicons-arrow-trending-up',
        color: 'text-green-600',
    },
    {
        label: t('market.overview.decrease'),
        value: props.salesVolume.decreasing,
        icon: 'i-heroicons-arrow-trending-down',
        color: 'text-red-600',
    },
    {
        label: t('market.overview.stable'),
        value: props.salesVolume.stable,
        icon: 'i-heroicons-minus',
        color: 'text-gray-500',
    },
]);
</script>

<template>
    <UCard class="h-full" :ui="{ base: 'flex flex-col', body: { base: 'flex flex-1 flex-col' } }">
        <p class="text-center font-semibold">{{ t('market.overview.salesVolume') }}</p>
        <div class="flex flex-1 flex-col justify-center">
            <template v-for="(row, index) in rows" :key="row.label">
                <UDivider v-if="index > 0" />
                <div class="flex items-center justify-between py-3">
                    <span class="flex items-center gap-2">
                        <UIcon :name="row.icon" :class="['h-5 w-5', row.color]" />
                        <span class="text-gray-700">{{ row.label }}</span>
                    </span>
                    <span :class="['font-semibold', row.color]">{{ row.value }}</span>
                </div>
            </template>
        </div>
    </UCard>
</template>
