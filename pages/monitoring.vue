<script setup lang="ts">
import type ComponentStatusData from '~/interfaces/component-status-data';
import type UsageStatsData from '~/interfaces/usage-stats-data';

const { t } = useI18n();

const { data: componentStatusData, status: componentStatusStatus } = useLazyFetch<ComponentStatusData[]>(
    '/api/monitoring/component-status',
);

const halfItems = computed(() => Math.round((componentStatusData.value?.length || 0) / 2));

const {
    data: resourceUsageData,
    status: usageStatsStatus,
    error: usageStatsError,
} = useLazyFetch<UsageStatsData>('/api/monitoring/resource-usage', {
    retry: false,
    server: false,
});

const formatBytes = (bytes: number): { value: number; unit: string } => {
    const units = [
        { label: 'GB', size: 1024 ** 3 },
        { label: 'MB', size: 1024 ** 2 },
        { label: 'KB', size: 1024 },
        { label: 'B', size: 1 },
    ];

    if (bytes === 0) return { value: 0, unit: 'B' };

    const unit = units.find((u) => bytes >= u.size) ?? units[units.length - 1];

    return {
        value: Number((bytes / unit.size).toFixed(1)),
        unit: unit.label,
    };
};

const getPercentageColorClass = (value: number | null): string => {
    if (value === null) return 'text-gray-600';
    if (value >= 0 && value < 60) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
};

const getVolumePercentage = (value: { capacity: number; available: number }) => {
    return Number((((value.capacity - value.available) / value.capacity) * 100).toFixed(1));
};

const getVolumeTooltip = (value: { capacity: number; available: number }) => {
    const available = formatBytes(value.available);
    const usedBytes = (getVolumePercentage(value) / 100) * value.capacity;
    const usedBytesFmt = formatBytes(usedBytes);
    return `${usedBytesFmt.value} ${usedBytesFmt.unit} used of ${available.value} ${available.unit} total`;
};

const resourcesUsageStats = computed(() => {
    const stats = resourceUsageData.value!;

    const memoryFmt = formatBytes(stats.memory);
    const minioPercentage = getVolumePercentage(stats.volume.minio);
    const mongodbPercentage = getVolumePercentage(stats.volume.mongodb);
    const postgresqlPercentage = getVolumePercentage(stats.volume.postgresql);
    const esPercentage = getVolumePercentage(stats.volume.elasticsearch);

    return [
        {
            key: 'cpu',
            name: t('dashboard.resources.usageStats.cpu'),
            value: Number(stats.cpu.toFixed(1)),
            unit: t('dashboard.resources.usageStats.cores'),
            icon: 'ph:cpu',
            additionalClasses: 'text-primary-500',
        },
        {
            key: 'memory',
            name: t('dashboard.resources.usageStats.memory'),
            value: memoryFmt.value,
            unit: memoryFmt.unit,
            icon: 'material-symbols:memory-alt-outline-rounded',
            additionalClasses: 'text-primary-500',
        },
        {
            key: 'minio',
            name: t('dashboard.resources.usageStats.minio'),
            value: minioPercentage,
            unit: '%',
            icon: 'simple-icons:minio',
            tooltip: getVolumeTooltip(stats.volume.minio),
            additionalClasses: getPercentageColorClass(minioPercentage),
        },
        {
            key: 'mongodb',
            name: t('dashboard.resources.usageStats.mongodb'),
            value: mongodbPercentage,
            unit: '%',
            icon: 'tabler:brand-mongodb',
            tooltip: getVolumeTooltip(stats.volume.mongodb),
            additionalClasses: getPercentageColorClass(mongodbPercentage),
        },
        {
            key: 'postgresql',
            name: t('dashboard.resources.usageStats.postgresql'),
            value: postgresqlPercentage,
            unit: '%',
            icon: 'carbon:database-postgresql',
            tooltip: getVolumeTooltip(stats.volume.postgresql),
            additionalClasses: getPercentageColorClass(postgresqlPercentage),
        },
        {
            key: 'elasticsearch',
            name: t('dashboard.resources.usageStats.elasticsearch'),
            value: esPercentage,
            unit: '%',
            icon: 'tabler:brand-elastic',
            tooltip: getVolumeTooltip(stats.volume.elasticsearch),
            additionalClasses: getPercentageColorClass(esPercentage),
        },
    ];
});
</script>

<template>
    <div class="justify-center items-center px-6 xl:px-0 max-w-7xl mx-auto w-full">
        <PageContainer>
            <div class="flex flex-col w-full mt-8">
                <div class="flex gap-8 flex-wrap xl:flex-nowrap">
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
                                <div class="flex flex-col gap-1 w-full pl-2">
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
                        <div
                            v-if="componentStatusStatus === 'pending'"
                            class="flex w-full flex-col gap-4 overflow-y-auto"
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
                                v-for="item in resourcesUsageStats"
                                :key="item.key"
                                :name="item.name"
                                :value="item.value"
                                :icon="item.icon"
                                :unit="item.unit"
                                :tooltip="item.tooltip"
                                :additional-classes="item.additionalClasses"
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
    </div>
</template>
