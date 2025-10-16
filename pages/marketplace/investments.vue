<script setup lang="ts">
import dayjs from 'dayjs';

const { data, status, error } = useFetch<Record<string, any>[]>(`/api/invest/get-user-investments`);

const { t } = useI18n();

const config = useRuntimeConfig();

const columns = [
    {
        key: 'title',
        label: t('invest.datasetTitle'),
        sortable: true,
    },
    {
        key: 'percentage',
        label: t('invest.percentage'),
        sortable: true,
        class: 'text-center w-1/6',
    },
    {
        key: 'status',
        label: t('invest.status'),
        sortable: true,
        class: 'text-center w-1/6',
    },
    {
        key: 'date',
        label: t('invest.dateInvested'),
        sortable: true,
        class: 'text-center w-1/6',
    },
    {
        key: 'view',
        label: t('invest.viewPlan'),
        class: 'text-center w-1/6',
    },
];

const pageCount = 10;

const sort = ref({
    column: 'date',
    direction: 'desc',
});

const { page, paginatedRows, sortBy } = useTable(data, pageCount, sort);

const investOpen = ref(false);

const assetId = ref();

const openModal = (id: string) => {
    assetId.value = id;
    investOpen.value = true;
};
</script>

<template>
    <UModal v-model="investOpen" :ui="{ width: 'sm:max-w-5xl', overlay: { background: 'bg-gray-800/75' } }">
        <InvestViewer :asset-id="assetId" hide-buy @close-modal="investOpen = false" />
    </UModal>
    <div class="justify-center items-center max-w-7xl w-full text-gray-600">
        <PageContainer>
            <UProgress v-if="status === 'pending'" />
            <UAlert
                v-else-if="error"
                :title="$t('invest.investmentsError') + ': ' + (error.statusMessage || error.message || error.status)"
                color="red"
                variant="subtle"
                icon="material-symbols:error-outline-rounded"
            />
            <UAlert
                v-else-if="!data || !data.length"
                :title="$t('invest.notFoundError')"
                color="yellow"
                variant="subtle"
                icon="nonicons:not-found-16"
            />
            <div v-else class="flex flex-col gap-6 w-full">
                <SubHeading :title="$t('invest.userInvestments')" :info="$t('invest.subtitle')" />
                <UCard class="w-full">
                    <UTable v-model:sort="sortBy" :columns="columns" :rows="paginatedRows">
                        <template #date-data="{ row }">
                            <span class="flex justify-center">{{ dayjs(row.date).format('DD/MM/YYYY') }}</span>
                        </template>

                        <template #title-data="{ row }">
                            <UTooltip
                                :class="'cursor-pointer'"
                                :text="row.description"
                                :popper="{ placement: 'top' }"
                                :ui="{ width: 'max-w-2xl', base: 'text-wrap' }"
                            >
                                <a
                                    :href="`${config.public.factoryUrl}/marketplace/dataset-details/${row.assetId}?pm=cloud`"
                                    target="_blank"
                                    class="text-primary"
                                >
                                    {{ row.title }}
                                </a>
                            </UTooltip>
                        </template>

                        <template #percentage-data="{ row }">
                            <span class="flex justify-center font-semibold"
                                >{{ ((row.shares / row.investmentPlan.totalShares) * 100).toFixed(2) }}%</span
                            >
                        </template>

                        <template #expirationDate-data="{ row }">
                            <span class="flex justify-center">{{
                                dayjs(row.expirationDate).format('DD/MM/YYYY')
                            }}</span>
                        </template>

                        <template #view-data="{ row }">
                            <span class="flex justify-center">
                                <UButton variant="soft" @click="openModal(row.assetId)">{{ $t('view') }}</UButton>
                            </span>
                        </template>

                        <template #status-data="{ row }">
                            <span class="flex justify-center">
                                <UTooltip
                                    :prevent="!row.investmentPlan.status"
                                    :text="`${$t('invest.becomesActive')} ${dayjs(row.investmentPlan.dueDate).format('DD/MM/YYYY')}`"
                                    :popper="{ placement: 'top' }"
                                    class="cursor-pointer"
                                >
                                    <UBadge v-if="row.investmentPlan.status" variant="soft" color="yellow">{{
                                        $t('invest.ongoing')
                                    }}</UBadge>
                                    <UBadge v-else variant="soft" color="green">{{ $t('invest.active') }}</UBadge>
                                </UTooltip>
                            </span>
                        </template>
                    </UTable>
                    <div v-if="data && data?.length > pageCount" class="flex justify-end mt-2">
                        <UPagination
                            v-model="page"
                            :page-count="pageCount"
                            :total="data?.length"
                            :active-button="{ variant: 'outline' }"
                        />
                    </div>
                </UCard>
            </div>
        </PageContainer>
    </div>
</template>
