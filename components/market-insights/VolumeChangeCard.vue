<script setup lang="ts">
import type {
    MarketInsightGranularity,
    MarketInsightVolumeChangeByGranularity,
} from '~/interfaces/market-insight-volume-change';

const { t } = useI18n();

const { data, error } = await useLazyFetch<MarketInsightVolumeChangeByGranularity[]>(
    '/api/market-insights/volume-changes',
);

const labels: Record<MarketInsightGranularity, string> = {
    day: t('intervals.daily'),
    week: t('intervals.weekly'),
    month: t('intervals.monthly'),
};

const rows = computed(() =>
    (data.value ?? []).map((item) => {
        // Backend volumeChangePct is a ratio (e.g. -0.2); display it as a rounded percentage.
        const percent = item.volumeChangePct == null ? null : Math.round(item.volumeChangePct * 1000) / 10;
        const positive = percent != null && percent > 0;
        const negative = percent != null && percent < 0;
        return {
            label: labels[item.granularity],
            percent,
            icon: positive
                ? 'i-heroicons-arrow-trending-up'
                : negative
                  ? 'i-heroicons-arrow-trending-down'
                  : 'i-heroicons-minus',
            color: positive ? 'text-green-600' : negative ? 'text-red-600' : 'text-gray-500',
        };
    }),
);
</script>

<template>
    <MarketInsightError v-if="error" class="h-full" />
    <UCard v-else class="h-full" :ui="{ base: 'flex flex-col', body: { base: 'flex flex-1 flex-col' } }">
        <p class="text-center font-semibold first-letter:uppercase">
            {{ t('market.overview.changeIn') }} {{ t('market.overview.volume') }}
        </p>
        <div class="flex flex-1 flex-col justify-center">
            <template v-for="(row, index) in rows" :key="row.label">
                <UDivider v-if="index > 0" />
                <div class="flex items-center justify-between py-3">
                    <span class="flex items-center gap-2">
                        <UIcon :name="row.icon" :class="['h-5 w-5', row.color]" />
                        <span class="text-gray-700">{{ row.label }}</span>
                    </span>
                    <span :class="['font-semibold', row.color]">
                        <template v-if="row.percent === null">—</template>
                        <template v-else>{{ row.percent > 0 ? '+' : '' }}{{ row.percent }}%</template>
                    </span>
                </div>
            </template>
        </div>
    </UCard>
</template>
