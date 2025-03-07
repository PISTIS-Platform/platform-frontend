<script setup lang="ts">
import type ComponentStatusData from '~/interfaces/component-status-data';
import type UsageStatsData from '~/interfaces/usage-stats-data';

const { t } = useI18n();

//data for component statuses
const { data: componentStatusData, status: componentStatusStatus } = useLazyFetch<ComponentStatusData[]>(
    '/api/monitoring/component-status',
);

//data for usage stats
const {
    data: usageStatsData,
    status: usageStatsStatus,
    error: usageStatsError,
} = useLazyFetch<UsageStatsData[]>('/api/monitoring/resource-usage');

const computedResourcesUsageStats = computed(() => {
    const iconsMapping: Record<string, string> = {
        cpu: 'ph:cpu',
        memory: 'material-symbols:memory-alt-outline-rounded',
        minio: 'simple-icons:minio',
        mongoDb: 'tabler:brand-mongodb',
        postgres: 'carbon:database-postgresql',
        elasticSearchAvg: 'tabler:brand-elastic',
    };

    return (usageStatsData?.value || []).map((item: UsageStatsData) => ({
        title: t(`dashboard.resources.usageStats.${item.key}`),
        percentage: item.percentage,
        icon: iconsMapping[item.key],
        tooltipInfo: item.extraInfo
            ? item.extraInfo.map((item: { key: string; value: number }) => ({
                  label: t(`dashboard.resources.usageStats.${item.key}`),
                  value: `${item.value} %`,
              }))
            : [],
    }));
});
</script>

<template>
    <div class="justify-center items-center px-8 max-w-7xl mx-auto w-full">
        <PageContainer>
            <div class="flex flex-col w-full mt-8">
                <div class="grid grid-cols-2 gap-8 place-items-stretch">
                    <!-- Components statuses -->
                    <UCard :ui="{ base: 'w-full' }">
                        <template #header>
                            <SubHeading :title="t('dashboard.resources.componentStatus')" />
                        </template>
                        <div
                            v-if="componentStatusStatus !== 'pending'"
                            class="flex w-full flex-col gap-4 overflow-y-scroll"
                        >
                            <StatusCard
                                v-for="item in componentStatusData"
                                :key="item.title"
                                :title="item.title"
                                :active="item.active"
                            />
                        </div>
                        <!--FIXME: Currently using fixed number of skeleton elements based on number of components-->
                        <div
                            v-if="componentStatusStatus === 'pending'"
                            class="flex w-full flex-col gap-4 overflow-y-scroll"
                        >
                            <USkeleton
                                v-for="item in new Array(10)"
                                :key="item"
                                :ui="{ background: 'bg-gray-200' }"
                                class="h-7 w-full"
                            />
                        </div>
                    </UCard>

                    <!-- Resources usage -->
                    <UCard :ui="{ base: 'w-full' }">
                        <template #header>
                            <SubHeading :title="t('dashboard.resources.resourceUsage')" />
                        </template>
                        <div
                            v-if="usageStatsStatus !== 'pending' && !usageStatsError"
                            class="grid grid-cols-2 w-full gap-6 mt-4"
                        >
                            <UsageCard
                                v-for="item in computedResourcesUsageStats"
                                :key="item.title"
                                :title="item.title || ''"
                                :icon="item.icon"
                                :percentage="item.percentage"
                                :tooltip-info="item.tooltipInfo"
                            />
                        </div>
                        <div v-else-if="usageStatsStatus !== 'pending' && usageStatsError">
                            <ErrorCard
                                :error-msg="
                                    usageStatsError?.statusMessage ??
                                    t('dashboard.resources.usageStats.errorInRetrievingCpuAndMemoryStats')
                                "
                            />
                        </div>
                        <div v-else class="grid grid-cols-2 w-full gap-6 mt-4">
                            <USkeleton
                                v-for="item in new Array(6)"
                                :key="item"
                                :ui="{ background: 'bg-gray-200' }"
                                class="h-20"
                            />
                        </div>
                    </UCard>
                </div>
            </div>
        </PageContainer>
    </div>
</template>
