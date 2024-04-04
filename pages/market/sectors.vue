<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

import { timeframeIntervalSelections } from '~/constants/market-insights';
import type { BasicSector } from '~/interfaces/market-insights';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

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

const sectorsSalesTimeframeSelection = ref('W');

const sectorsSales = computed(() => {
    return {
        data: {
            //FIXME:: fix labels based on actual data
            labels: ['January', 'February', 'March', 'April'],
            datasets: [
                {
                    label: 'Dataset 1',
                    data: [1000, 490, 230, 900],
                    backgroundColor: '#ACDC94',
                },
                {
                    label: 'Dataset 2',
                    data: [1000, 490, 230, 900].reverse(),
                    backgroundColor: '#E9A364',
                },
                {
                    label: 'Dataset 3',
                    data: [460, 900, 90, 380],
                    backgroundColor: '#5ABCCF',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                },
            },
        },
    };
});
</script>

<template>
    <PageContainer>
        <!-- Overview section-->
        <SubHeading :title="$t('market.sectors.overview')" />

        <!-- Sectors Cards-->
        <div class="flex gap-8 justify-start items-center mt-8 w-full">
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

        <!-- Sectors Stacked Bar Chart-->
        <ChartContainer v-if="sectorsSales" :title="$t('market.sectors.allSectorsSales')" class="mt-8">
            <template #right-header>
                <TimeframeSelector
                    :model-value="sectorsSalesTimeframeSelection"
                    :selections="timeframeIntervalSelections"
                    @update:model-value="(value: string) => (sectorsSalesTimeframeSelection = value)"
                ></TimeframeSelector>
            </template>

            <Bar class="w-full h-full" :data="sectorsSales.data" :options="sectorsSales.options" />
        </ChartContainer>
    </PageContainer>
</template>
