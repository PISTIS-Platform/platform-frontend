<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { BasicSector } from '~/interfaces/market-insights';

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

const {
    data: sectorsBasicInfo,
    pending: loadingSectorsBasicInfo,
    error: sectorsBasicInfoError,
} = await useLazyFetch<BasicSector[]>('/api/market-insights/sectors');

if (sectorsBasicInfoError.value) {
    showErrorMessage(t('market.sectors.errorInLoadingBasicInfo'));
}
</script>

<template>
    <PageContainer>
        <!-- Overview section-->
        <SubHeading :title="$t('market.sectors.overview')" />

        <!-- Sectors Cards-->
        <div class="flex gap-8 justify-start items-center mt-8">
            <div v-if="loadingSectorsBasicInfo" class="flex justify-start w-full gap-8">
                <USkeleton
                    v-for="item in new Array(3)"
                    :key="item"
                    :ui="{ background: 'bg-gray-300' }"
                    class="h-24 w-72"
                />
            </div>
            <div v-for="sector in sectorsBasicInfo" v-else :key="sector.name">
                <UCard>
                    <div class="flex flex-col justify-between gap-6">
                        <span class="text-gray-600 text-xl font-bold">{{ sector.name }}</span>
                        <span
                            >{{ $t('market.sectors.changeSince1WeekAgo') }}
                            <ChangeText :change-value="sector.change" class="ml-1" size="xl"
                        /></span>
                    </div>
                </UCard>
            </div>
        </div>
    </PageContainer>
</template>
