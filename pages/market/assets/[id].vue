<script setup lang="ts">
import { useRoute } from 'nuxt/app';

import { BasicAsset } from '~/interfaces/market-insights';

// const { t } = useI18n();

const route = useRoute();

const _assetID = route.params.id;

//TODO: Get asset info from API call
const assets: BasicAsset[] = [
    {
        name: 'Asset 1',
        price: 20000,
        change: 4.6,
        data: [13, 56, 34, 20, 34, 45, 60],
    },
    {
        name: 'Asset 2',
        price: 45000,
        change: 9.6,
        data: [13, 56, 34, 20, 34, 45, 60].reverse(),
    },
    {
        name: 'Asset 3',
        price: 90000,
        change: -5.6,
        data: [90, 16, 34, 20, 34, 45, 60],
    },
    {
        name: 'Asset 4',
        price: 90000,
        change: 0,
        data: [13, 56, 34, 20, 34, 45, 60],
    },
];

//TODO: Get with API call using asset ID
const assetInfo = {
    title: 'Asset Title Here',
    seller: 'Seller Name Here',
    views: 500000,
    monetization_plan: 'Subscription',
    data_quality_index: 5,
    sector: 'Aviation',
};
</script>

<template>
    <PageContainer>
        <RollingAssetsBar :assets="assets" />
        <ChartContainer :title="assetInfo.title" class="mt-6">
            <div class="flex w-full justify-between items-center text-gray-500">
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-user" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Seller: <span class="font-bold">{{ assetInfo.seller }}</span></span
                    >
                </div>
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-eye" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Views: <span class="font-bold">{{ $n(assetInfo.views) }}</span></span
                    >
                </div>
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-money-bill-1" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Monetisation Plan: <span class="font-bold">{{ assetInfo.monetization_plan }}</span></span
                    >
                </div>
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-rectangle-list" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Sector: <span class="font-bold">{{ assetInfo.sector }}</span></span
                    >
                </div>
                <div class="flex gap-2 items-center">
                    <UIcon name="i-fa6-regular-file-lines" class="h-6 w-6 text-primary-500" />
                    <span class="text-sm"
                        >Data Quality Index: <span class="font-bold">{{ assetInfo.data_quality_index }}</span></span
                    >
                </div>
            </div>
        </ChartContainer>
    </PageContainer>
</template>
