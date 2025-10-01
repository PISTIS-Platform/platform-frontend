<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import Sidebar from 'primevue/sidebar';

// import { ref, toRef } from 'vue'
import { useDcatApSearch } from '@/sdk';

import { useDatasetSearchView } from './useDatasetsSearchView';
import { useSearchParams } from './useSearchParams';
import { useSelectedFacets } from './useSelectedFacets';

const queryClient = useQueryClient();

// const route = useRoute();
// const pistisMode = computed(() => route.query.pistisMode || 'factory');
// const pistisMode = route.query.pm;
// console.log('pistisMode:', pistisMode);

const searchInput = defineModel<string>('searchInput', { required: true });
const hvdModel = defineModel<boolean>('hvd', { required: true });
const livedataModel = defineModel<boolean>('livedata', { required: true });
const selectedFacets = toRef(useSelectedFacets());
const searchParams = useSearchParams();
// const page = defineModel<number>('page', { required: true });
const sidebarVisible = ref(false);

function toggleFacetSidebar() {
    sidebarVisible.value = !sidebarVisible.value;
}

const {
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
} = useDatasetSearchView({
    isPublic: true,
    searchInput,
    hvdModel,
    livedataModel,
    selectedFacets,
    searchParams,
    hubSearchQueryDefinition: useDcatApSearch,
});

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
                <div name="stickysidey" class="">
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
                <SearchBar v-model="searchInput" :search-action="doSearch" />
                <div class="flex-1">
                    <section name="datasets" class="mb-10 flex flex-col gap-6 px-6">
                        <SelectedFacetsOverview v-model="selectedFacets" :facets="availableFacetsFormatted" />
                        <div class="flex flex-col gap-6">
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
                        />
                    </section>
                </div>
            </div>
        </div>
    </PageContainer>
</template>
