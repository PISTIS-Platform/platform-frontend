<script setup lang="ts">
import type { MarketInsightAssetTimeline } from '~/interfaces/market-insight-asset-timeline';
import type { MarketInsightOverview } from '~/interfaces/market-insight-overview';
import type { MarketInsightPerformingAssets } from '~/interfaces/market-insight-performing-assets';

const { t } = useI18n();

const { data: assets, error: assetsError } = await useLazyFetch<MarketInsightAssetTimeline[]>(
    '/api/market-insights/assets-timeline',
);
const { data: overview, error: overviewError } = await useLazyFetch<MarketInsightOverview>(
    '/api/market-insights/overview',
);
const { data: performing, error: performingError } = await useLazyFetch<MarketInsightPerformingAssets>(
    '/api/market-insights/performing-assets',
);

const tiles = computed(() =>
    overview.value
        ? [
              {
                  label: t('market.overview.totalAssets'),
                  value: overview.value.totalAssets.toLocaleString(),
                  icon: 'i-heroicons-cube',
              },
              {
                  label: t('market.overview.totalMarketCap'),
                  value: overview.value.totalMarketCap.toLocaleString(),
                  icon: 'i-heroicons-banknotes',
              },
              {
                  label: t('market.overview.averageSales'),
                  value: overview.value.averageSalesPerDay.toFixed(2),
                  icon: 'i-heroicons-calendar-days',
              },
              {
                  label: t('market.overview.totalSales'),
                  value: overview.value.totalSales.toLocaleString(),
                  icon: 'i-heroicons-shopping-bag',
              },
          ]
        : [],
);
</script>

<template>
    <PageContainer>
        <AssetsSlider v-if="assets" :assets="assets" class="mt-6" />
        <MarketInsightError v-else-if="assetsError" class="mt-6" />

        <div class="mt-6 flex w-full flex-col gap-4 xl:flex-row">
            <template v-if="overview">
                <div class="grid grid-cols-2 grid-rows-2 gap-4 xl:flex-[2]">
                    <StatTile
                        v-for="tile in tiles"
                        :key="tile.label"
                        :label="tile.label"
                        :value="tile.value"
                        :icon="tile.icon"
                    />
                </div>
                <SalesVolumeCard :sales-volume="overview.salesVolume" class="w-full xl:flex-1" />
            </template>
            <MarketInsightError v-else-if="overviewError" class="w-full xl:flex-[3]" />
            <VolumeChangeCard class="w-full xl:flex-1" />
        </div>

        <SalesTimelineChart class="mt-6" />

        <div v-if="performing" class="mt-6 flex w-full flex-col gap-6">
            <PerformingAssetsTable :title="$t('market.overview.topPerforming')" :assets="performing.top" />
            <PerformingAssetsTable :title="$t('market.overview.worstPerforming')" :assets="performing.worst" />
        </div>
        <MarketInsightError v-else-if="performingError" class="mt-6" />

        <LatestTransactionsTable class="mt-6" />
    </PageContainer>
</template>
