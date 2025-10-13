<script setup lang="ts">
// import { useVModel } from '@vueuse/core';
// import { toRefs } from 'vue';
// import { useI18n } from 'vue-i18n';

import type { FacetList } from '@/utils/types';
// import KFacetGroup from '../base/facet-group/KFacetGroup.vue';

// Need to export the types so that the generics work properly
export type { Facet } from '@/utils/types';
export type { FacetList };

const props = defineProps<{
    public?: boolean;
    facets: FacetList<string>;
    ghost?: boolean;
    mobile?: boolean;
    modelValue: Record<string, string[]>;
}>();

const emit = defineEmits(['update:modelValue']);

const { facets } = toRefs(props);

const model = useVModel(props, 'modelValue', emit, { passive: true });

// Filtering investment offers
const isInvestment = ref(false);
const loading = ref(false);
const SPARQL_ENDPOINT = 'https://pistis-market.eu/srv/virtuoso/sparql';
const onInvestmentChecked = async () => {
    try {
        loading.value = true;

        // SPARQL query for investment-related data
        const sparqlQuery = `
            PREFIX dcat: <http://www.w3.org/ns/dcat#>
            PREFIX pistis: <https://www.pistis-project.eu/ns/voc#>

            SELECT (STRAFTER(STR(?dataset), "https://pistis-market.eu/catset/data/") AS ?datasetId)
            WHERE {
                ?dataset a dcat:Dataset .
                ?dataset pistis:monetization ?monetization .
                ?monetization pistis:investmentOffer ?investmentOffer .
            }`;

        const response = await fetch(SPARQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/sparql-results+json',
            },
            body: new URLSearchParams({
                query: sparqlQuery,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Extract dataset IDs and put them in the list
        const datasetIds = data.results.bindings
            .map((binding: any) => binding.datasetId?.value)
            .filter((id: string) => id); // Filter out any undefined/null values

        searchInvestmentOffersById(datasetIds);
    } catch (error) {
        console.error('Error fetching investment data:', error);
    } finally {
        loading.value = false;
    }
};

const searchInvestmentOffersById = (investmentDatasetIds: any[]) => {
    if (investmentDatasetIds.length === 0) {
        console.log('No investment datasets found');
        return;
    }

    // Create OR-separated query string
    const orQuery = investmentDatasetIds.join(' OR ');
    const searchUrl =
        `https://pistis-market.eu/srv/search/search?filters=dataset&q=${encodeURIComponent(orQuery)}&` +
        `fields=id,title.en,description.en,keywords,distributions.id,distributions.title,monetization&`;

    console.log('Search URL:', searchUrl);

    // ## NOTE ##
    // Without users search terms: q=id-1 OR id-2 OR id-3 OR id-n
    // With users search terms: q=(id-1 OR id-2 OR id-3 OR id-n) AND pistis
};

const onInvestmentUnchecked = () => {
    console.log('Investment disabled: Remove all investment dataset IDs from q');
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="ghost" class="h-[720px] w-full animate-pulse rounded-lg border bg-surface-200" />
        <template v-else>
            <div class="flex w-80 flex-col rounded bg-neutral-200 border border-neutral-300 shadow-md">
                <!-- Switch to list investment offers -->
                <label class="switch">
                    <input
                        v-model="isInvestment"
                        type="checkbox"
                        @change="isInvestment ? onInvestmentChecked() : onInvestmentUnchecked()"
                    />
                    <span class="slider round">Investment</span>
                </label>
                <KFacetGroup
                    v-for="facet of facets.filter((facet) => facet.items.length > 0)"
                    :id="`facet-group-${facet.id}`"
                    :key="JSON.stringify(facet)"
                    v-model="model[facet.id]"
                    :title="facet.label"
                    :facets="facet.items"
                />
            </div>
        </template>
    </div>
</template>
