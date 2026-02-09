<script setup lang="ts">
// import { computed, defineProps } from 'vue';

// import DataInfoCard from '@/components/base/data-info-box/DataInfoCard.vue';
import Paginator from 'primevue/paginator';

import { useSearchParams } from '@/pages/catalog/useSearchParams';

const route = useRoute();

const _props = defineProps<{
    items: [];
    getSearchResultsPagesCount: number;
    isLoading: boolean;
    isFetching: boolean;
    showOnlyPublic: boolean;
}>();
const searchParams = useSearchParams();
const itemsCount = computed(() => searchParams?.queryParams?.limit ?? 10);

const toRoute = computed(() =>
    route.query.pm === 'cloud' ? 'marketplace-dataset-details-datasetId' : 'catalog-dataset-details-datasetId',
);
</script>

<template>
    <div class="flex flex-col gap-6">
        <template v-if="!isLoading && !isFetching">
            <slot v-for="item in items" :key="item.id" :item="item">
                <DataInfoCard
                    :to="{
                        name: toRoute,
                        params: { datasetId: item.id },
                        query: { pm: route.query.pm },
                    }"
                    :title="item.title"
                    :description="item.description"
                    :file-formats="item.formats"
                    :properties="item.summary"
                    :catalog="item.catalog"
                />
            </slot>
        </template>
        <template v-else>
            <div
                v-for="i in itemsCount.value"
                :key="i"
                class="flex size-full animate-pulse flex-col gap-6 bg-slate-200 text-content rounded-3xl"
            >
                <div class="flex h-64 flex-wrap gap-2" />
            </div>
        </template>
    </div>
    <div class="grid w-full place-content-center">
        <Paginator
            v-model:first="searchParams.queryParams.page.value"
            class="cursor-pointer ring-1 ring-gray-200 rounded shadow-md"
            :pt="{ root: { class: 'rounded-lg' } }"
            :rows="1"
            :total-records="getSearchResultsPagesCount"
        />
    </div>
</template>

<style>
.p-paginator-page {
    @apply text-black px-3 py-1 bg-white;
}

.p-paginator-page.p-highlight {
    @apply border border-pistis-500 text-pistis-500 bg-pistis-50 font-semibold;
}
</style>
