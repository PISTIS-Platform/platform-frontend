<script setup lang="ts">
import type ComponentStatusData from '~/interfaces/component-status-data';
import type UsageStatsData from '~/interfaces/usage-stats-data';

const { t } = useI18n();

//data for component statuses
const { data: componentStatusData, status: componentStatusStatus } = useLazyFetch<ComponentStatusData[]>(
    '/api/monitoring/component-status',
);

const halfItems = computed(() => Math.round((componentStatusData.value?.length || 0) / 2));

//data for usage stats
const {
    data: usageStatsData,
    status: usageStatsStatus,
    error: usageStatsError,
} = useLazyFetch<UsageStatsData[]>('/api/monitoring/resource-usage', {
    retry: false,
    server: false,
});

const computedResourcesUsageStats = computed(() => {
    const iconsMapping: Record<string, string> = {
        cpu: 'ph:cpu',
        memory: 'material-symbols:memory-alt-outline-rounded',
        minio: 'simple-icons:minio',
        mongoDb: 'tabler:brand-mongodb',
        postgres: 'carbon:database-postgresql',
        esInstance: 'tabler:brand-elastic',
    };

    return (usageStatsData?.value || []).map((item: UsageStatsData) => ({
        title: t(`dashboard.resources.usageStats.${item.key}`),
        percentage: item.percentage,
        icon: iconsMapping[item.key],
    }));
});
</script>

<template>
    <PageContainer>
        <div class="flex flex-col w-full mt-8">
            <div class="grid grid-cols-2 gap-8 place-items-stretch">
                <!-- Components statuses -->
                <UCard :ui="{ base: 'w-full' }">
                    <template #header>
                        <SubHeading :title="t('dashboard.resources.componentStatus')" />
                    </template>
                    <div v-if="componentStatusStatus !== 'pending'" class="flex w-full overflow-y-auto">
                        <div class="flex divide-x-2 w-full">
                            <div class="flex flex-col gap-1 w-full">
                                <StatusCard
                                    v-for="item in componentStatusData?.slice(0, halfItems)"
                                    :key="item.title"
                                    :title="item.title"
                                    :active="item.active"
                                />
                            </div>
                            <div class="flex flex-col gap-1 w-full pl-4">
                                <StatusCard
                                    v-for="item in componentStatusData?.slice(halfItems)"
                                    :key="item.title"
                                    :title="item.title"
                                    :active="item.active"
                                />
                            </div>
                        </div>
                    </div>
                    <!--FIXME: Currently using fixed number of skeleton elements based on number of components-->
                    <div v-if="componentStatusStatus === 'pending'" class="flex w-full flex-col gap-4 overflow-y-auto">
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
                    <div v-if="usageStatsStatus === 'pending'" class="grid grid-cols-2 w-full gap-6 mt-4">
                        <USkeleton
                            v-for="item in new Array(6)"
                            :key="item"
                            :ui="{ background: 'bg-gray-200' }"
                            class="h-20"
                        />
                    </div>
                    <div v-else-if="!usageStatsError" class="grid grid-cols-2 w-full gap-6 mt-4">
                        <UsageCard
                            v-for="item in computedResourcesUsageStats"
                            :key="item.title"
                            :title="item.title || ''"
                            :icon="item.icon"
                            :percentage="item.percentage"
                        />
                    </div>
                    <div v-else>
                        <ErrorCard
                            :error-msg="
                                usageStatsError?.statusMessage ??
                                t('dashboard.resources.usageStats.errorInRetrievingCpuAndMemoryStats')
                            "
                        />
                    </div>
                </UCard>
            </div>
        </div>
    </PageContainer>
</template>
