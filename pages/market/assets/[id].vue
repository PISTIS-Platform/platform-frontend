<script setup lang="ts">
import { useRoute } from 'nuxt/app';

import { BasicAsset } from '~/interfaces/market-insights';

// const { t } = useI18n();

const route = useRoute();

const assetID = route.params.id;

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
</script>

<template>
    <PageContainer>
        <RollingAssetsBar :assets="assets" />
        {{ assetID }}
    </PageContainer>
</template>
