<script setup lang="ts">
import dayjs from 'dayjs';

const { t } = useI18n();
const {
    data: datasetsData,
    status: datasetsStatus,
    error: datasetsError,
} = useFetch<Record<string, any>[]>(`/api/datasets/get-all-on-marketplace`, {
    server: false,
});

const transformedDatasets = computed(() =>
    datasetsData.value?.map((dataset) => ({
        id: dataset.id,
        title: dataset.title.en,
        description: dataset.description.en,
        issued: dataset.issued,
    })),
);

const columns: { key: string; label: string; sortable: boolean; class?: string }[] = [
    {
        key: 'issued',
        label: t('created'),
        sortable: true,
    },
    {
        key: 'id',
        label: 'ID',
        sortable: true,
    },
    {
        key: 'title',
        label: t('title'),
        sortable: true,
    },
    {
        key: 'description',
        label: t('description'),
        sortable: false,
    },

    {
        key: 'verified',
        label: t('data.usage.verified'),
        sortable: false,
        class: 'w-32',
    },
    {
        key: 'unverified',
        label: t('data.usage.unverified'),
        sortable: false,
        class: 'w-32',
    },
];
const pageCount = 10;
const { page, sortBy, searchString, filteredRows, paginatedRows } = useTable(transformedDatasets, pageCount, {
    column: 'issued',
    direction: 'desc',
});
</script>

<template>
    <div class="items-center justify-center w-full px-8 mx-auto max-w-7xl">
        <PageContainer>
            <UProgress v-if="datasetsStatus === 'pending'" animation="carousel" color="primary" />
            <ErrorCard
                v-else-if="datasetsError || datasetsData?.length === 0"
                :error-msg="datasetsError?.statusMessage ?? $t('data.usage.assetsNotFound')"
            />
            <div v-else class="w-full flex flex-col gap-4 text-gray-600">
                <SubHeading :title="$t('data.usage.title')" />
                <UCard class="flex flex-col gap-4">
                    <div class="w-full flex justify-end">
                        <UInput
                            v-model="searchString"
                            size="md"
                            :placeholder="$t('search')"
                            class="w-96"
                            icon="ic:baseline-search"
                            :trailing="false"
                        />
                    </div>
                    <UTable v-model:sort="sortBy" :columns="columns" :rows="paginatedRows" sort-mode="manual">
                        <template #issued-data="{ row }">
                            {{ dayjs(row.issued).format('YYYY/MM/DD HH:mm:ss') }}
                        </template>

                        <template #id-data="{ row }">
                            <UTooltip :text="row.id" :popper="{ placement: 'top' }">{{
                                row.id.slice(0, 5) + '...'
                            }}</UTooltip>
                        </template>
                        <template #title-data="{ row }">
                            <UTooltip :text="row.title" :popper="{ placement: 'top' }" :ui="{ width: 'max-w-2xl' }">
                                {{ `${row.title.slice(0, 30)}${row.description.length > 30 ? '...' : ''}` }}
                            </UTooltip>
                        </template>
                        <template #description-data="{ row }">
                            <UTooltip
                                :text="row.description"
                                :popper="{ placement: 'top' }"
                                :ui="{ width: 'max-w-2xl' }"
                            >
                                {{ `${row.description.slice(0, 10)}${row.description.length > 10 ? '...' : ''}` }}
                            </UTooltip>
                        </template>
                        <template #verified-data="{ row }">
                            <UButton
                                variant="outline"
                                :to="`/marketplace/usage-analytics/responses?assetId=${row.id}&forVerifiedBuyers=true`"
                                >{{ $t('view') }}</UButton
                            >
                        </template>
                        <template #unverified-data="{ row }"
                            ><UButton
                                variant="outline"
                                color="green"
                                :to="`/marketplace/usage-analytics/responses?assetId=${row.id}&forVerifiedBuyers=false`"
                                >{{ $t('view') }}</UButton
                            ></template
                        >
                    </UTable>
                    <UPagination
                        v-if="filteredRows.length > pageCount"
                        v-model="page"
                        :page-count="pageCount"
                        :total="filteredRows.length"
                        class="absolute bottom-2 right-6"
                    />
                </UCard>
            </div>
        </PageContainer>
    </div>
</template>
