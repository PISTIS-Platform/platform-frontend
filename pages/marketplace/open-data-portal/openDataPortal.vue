<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import Sidebar from 'primevue/sidebar';

import { useDatasetSearchView } from '@/pages/catalog/useDatasetsSearchView';
import { useSearchParams } from '@/pages/catalog/useSearchParams';
import { useSelectedFacets } from '@/pages/catalog/useSelectedFacets';
import { useDcatApSearch } from '@/sdk';

const queryClient = useQueryClient();
const route = useRoute();

const searchInput = defineModel<string>('searchInput', { required: true });
const hvdModel = defineModel<boolean>('hvd', { required: true });
const livedataModel = defineModel<boolean>('livedata', { required: true });
const selectedFacets = toRef(useSelectedFacets());
const searchParams = useSearchParams();
const sidebarVisible = ref(false);

const searchType = computed(() => {
    if (route.query.pm === 'openData') return 'openDataPortal';
    if (route.query.type === 'metadata') return 'metadata';
    if (route.query.type === 'data') return 'data';
    return 'metadata';
});

function toggleFacetSidebar() {
    sidebarVisible.value = !sidebarVisible.value;
}

let availableFacetsFormatted;
let sort;
let sortDirection;
let getSearchResultsCount;
let datasets;
let getSearchResultsPagesCount;
let isLoading;
let isFetching;
let showOnlyPublic;
let doSearch;
let loadMore;

let dsv = useDatasetSearchView({
    isPublic: true,
    searchInput,
    searchType,
    hvdModel,
    livedataModel,
    selectedFacets,
    searchParams,
    hubSearchQueryDefinition: useDcatApSearch,
});
({
    availableFacetsFormatted,
    sort,
    sortDirection,
    getSearchResultsCount,
    datasets,
    getSearchResultsPagesCount,
    isLoading,
    isFetching,
    showOnlyPublic,
    doSearch,
    loadMore,
} = dsv);

onMounted(() => {
    queryClient.invalidateQueries();
});
</script>

<template>
    <PageContainer>
        <!-- Facets toggle sidebar for small devices -->
        <Sidebar v-if="sidebarVisible" header="Search filter">
            <FacetSidebar
                v-model:model-value="selectedFacets"
                v-model:hvd="hvdModel"
                v-model:livedata="livedataModel"
                :public="true"
                mobile
                :facets="availableFacetsFormatted"
            />
        </Sidebar>
        <div
            class="w-full relative mx-auto grid max-w-content-max grid-cols-1 sm:grid-cols-[minmax(auto,20rem)_1fr] mt-4"
        >
            <!-- Permanent facets for large devices -->
            <div name="sidebar" class="relative hidden sm:block sm:max-w-96">
                <div name="stickysidey" class="flex">
                    <FacetSidebar
                        v-model:model-value="selectedFacets"
                        v-model:hvd="hvdModel"
                        v-model:livedata="livedataModel"
                        :public="true"
                        mobile
                        :facets="availableFacetsFormatted"
                    />
                </div>
            </div>
            <div name="content" class="flex flex-col overflow-x-auto">
                <FacetBurgerButton class="sm:hidden" :open-sidebar="toggleFacetSidebar" />
                <SearchBar
                    v-model="searchInput"
                    v-model:search-type="searchType"
                    :search-action="doSearch"
                    :search-data-action="doDataSearch"
                    :search-type-selector="true"
                />
                <div class="flex-1">
                    <section name="datasets" class="mb-10 flex flex-col px-6">
                        <SelectedFacetsOverview v-model="selectedFacets" :facets="availableFacetsFormatted" />
                        <div class="flex flex-col pb-6">
                            <SearchInfoPanel v-model:direction="sortDirection" v-model:sort="sort">
                                <span class="font-semibold text-primary-600">{{ getSearchResultsCount }}</span>
                                <span class="font-normal pl-1">{{ $t('searchBar.datasets.found') }}</span>
                            </SearchInfoPanel>
                        </div>
                        <SearchItems
                            :items="datasets"
                            :get-search-results-pages-count="getSearchResultsPagesCount"
                            :is-loading="isLoading"
                            :is-fetching="isFetching"
                            :show-only-public="showOnlyPublic"
                            :load-more="loadMore"
                        />
                    </section>
                </div>
            </div>
        </div>
    </PageContainer>
</template>
