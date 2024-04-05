<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { useI18n } from 'vue-i18n';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const { t } = useI18n();

const route = useRoute();

const _sectorId = route.params.id;

const sectorTimeframeSelection = ref('W');

const sectorInfo: Record<string, any> = {
    name: 'Sector 1',
    changeTimeframeAgo: {
        D: {
            change: 13,
            totalSales: 230,
            marketCap: 400,
        },
        W: {
            change: 60,
            totalSales: 450,
            marketCap: 890,
        },
        M: {
            change: -70,
            totalSales: 100,
            marketCap: 200,
        },
    },
};

const changeSinceTimeframeAgoText = computed(() => {
    if (sectorTimeframeSelection.value === 'D') {
        return t('market.changeSince1DayAgo');
    }

    if (sectorTimeframeSelection.value === 'W') {
        return t('market.changeSince1WeekAgo');
    }

    return t('market.changeSince1MonthAgo');
});
</script>

<template>
    <PageContainer>
        <!-- Sectors Info Card -->
        <UCard class="w-full">
            <div class="flex flex-col gap-6">
                <div class="flex justify-between gap-12">
                    <span class="text-gray-600 text-xl font-bold">{{ sectorInfo.name }}</span>
                    <TimeframeSelector v-model="sectorTimeframeSelection" />
                </div>

                <div class="flex gap-48">
                    <div>
                        <span class="text-gray-500 text-sm">{{ changeSinceTimeframeAgoText }}</span>
                        <ChangeText
                            :change-value="sectorInfo.changeTimeframeAgo[sectorTimeframeSelection].change"
                            size="2xl"
                            class="ml-2"
                        />
                    </div>
                    <div>
                        <span class="text-gray-500 text-sm">{{ $t('market.totalSales') }}</span>
                        <span class="text-gray-600 text-2xl ml-2 font-bold"
                            >{{ sectorInfo.changeTimeframeAgo[sectorTimeframeSelection].totalSales }}STC</span
                        >
                    </div>
                    <div>
                        <span class="text-gray-500 text-sm">{{ $t('market.marketCap') }}</span>
                        <span class="text-gray-600 text-2xl ml-2 font-bold">{{
                            sectorInfo.changeTimeframeAgo[sectorTimeframeSelection].marketCap
                        }}</span>
                    </div>
                </div>
            </div>
        </UCard>

        <!-- Sectors Stacked Bar Chart-->

        <!-- Moving averages -->
        <ChartContainer :title="$t('market.sectors.movingAverages')" class="mt-8">
            <div class="h-52"></div>
        </ChartContainer>

        <!-- Pie chart and right chart -->
        <div class="flex justify-between items-center gap-6 mt-8 w-full">
            <ChartContainer :title="$t('market.sectors.sectorsVsTotalMarketCap')" class="w-1/2">
                <div class="h-52"></div>
            </ChartContainer>
            <ChartContainer :title="$t('market.sectors.sectorsVsTotalMarketCap')" class="w-1/2">
                <div class="h-52"></div>
            </ChartContainer>
        </div>
    </PageContainer>
</template>
