<script setup lang="ts">
import type { PropertyTableEntryNode } from '@piveau/sdk-vue';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

import { PropertyTable } from '@/components/catalog/dataset-details/PropertyTableRow';
import { useDataTruncator } from '@/composables/useDataTruncator';
// import config from '../config/appConfig';
import { useDcatApSearch } from '@/sdk/index';
import { getLocalizedValue } from '@/sdk/utils/helpers';

function ensureDatasetId(id: Ref): asserts id is Ref<string> {
    if (typeof toValue(id) !== 'string') throw new Error('id must be a string');
}
// const route = useRoute();
// const pistisMode = route.query.pm;

// const searchUrl = ref(config);

const datasetId = useRouteParams('datasetId');

ensureDatasetId(datasetId);

const { useResource: getDataset } = useDcatApSearch();

const { isSuccess, query, resultEnhanced } = shallowReactive(getDataset(datasetId));

const getFormattedDistributions = computed(() => {
    if (!isSuccess.value) return [];
    if (!resultEnhanced.value?.getDistributions) return [];

    return resultEnhanced.value.getDistributions.map((dist) => {
        return {
            title: dist.title ?? dist.id ?? '',
            description: dist.description ?? '',
            descriptionMarkup: DOMPurify.sanitize(marked(dist.description ?? '', { async: false })),
            downloadUrls: dist.accessUrls || [],
            format: dist.format ?? '',
            id: dist.id,
            accessUrls: dist.accessUrls,
            modified: dist.modified ?? '',
            data: {
                type: 'node',
                id: 'root',
                label: 'root',
                data: dist.getPropertyTable,
            } satisfies PropertyTableEntryNode,
            linkedData: {
                'RDF/XML': dist.getLinkedData.rdf,
                Turtle: dist.getLinkedData.ttl,
                Notation3: dist.getLinkedData.n3,
                'N-Tripes': dist.getLinkedData.nt,
                'JSON-LD': dist.getLinkedData.jsonld,
            },
        };
    });
});

// const { getTitle, getId, getDescription, getPropertyTable, getFormattedDistributions, getCategories } = toRefs(resultEnhanced)
const { isError: searchError, error } = query;
// Parse AxiosError to get the error message
const errorView = computed(() => {
    if (searchError.value) {
        return error.value?.message || 'An error occurred';
    }
    return '';
});

// Distribution truncator ("show more")
const {
    data: truncatedFormattedDistributions,
    toggle: showAllDistributions,
    isTruncated: isDistributionsTruncated,
} = useDataTruncator({
    data: getFormattedDistributions,
    limit: 7,
});
</script>

<template>
    <div>
        <div v-if="error" class="grid size-full place-content-center bg-bg-base">
            <KCard class="size-96">
                <template #title> Fehler </template>
                <template #content>
                    {{ errorView }}
                </template>
            </KCard>
        </div>

        <DetailsPage
            headline="Dataset"
            :title="resultEnhanced?.getTitle || ''"
            :subtitle="resultEnhanced?.getPublisher?.name || ''"
            :dataset-id="datasetId"
            :summary="[
                {
                    title: 'data provider',
                    text: resultEnhanced?.getPublisher?.name || '-',
                },
                {
                    title: 'updated',
                    text: resultEnhanced?.getModified || '-',
                },
            ]"
            :description-markup="resultEnhanced?.getDescriptionMarkup"
        >
            <!-- <template #subtitle="{ subtitle }"> -->
            <!-- <RouterLink
                    :to="{ name: 'Datasets', query: { catalog: resultEnhanced?.getCatalogId } }"
                    class="by-link"
                >
                    {{ subtitle }}
                </RouterLink> -->
            <!-- </template> -->

            <template #sections>
                <UCard>
                    <template #header>
                        <span class="flex flex-col gap-0.5 items-start justify-center">
                            <h3 class="text-base font-semibold whitespace-nowrap">
                                Distributions
                                <UBadge color="primary" variant="soft">{{ getFormattedDistributions.length }}</UBadge>
                            </h3>
                        </span>
                    </template>

                    <template v-for="(distribution, i) in truncatedFormattedDistributions" :key="distribution.id">
                        <div name="distribution-card-wrapper" class="relative">
                            <DistributionCard
                                :title="distribution.title || ''"
                                :description="distribution.descriptionMarkup || ''"
                                :format="distribution.format || 'Unknown'"
                                :download-url="distribution.downloadUrls?.[0]!"
                                :last-updated="distribution.modified"
                                :data="distribution.data"
                                :linked-data="distribution.linkedData"
                                :dataset-id="datasetId"
                                :distribution-id="distribution.id"
                            />
                            <div
                                v-if="i === truncatedFormattedDistributions.length - 1 && isDistributionsTruncated"
                                name="distribution-card-overlay"
                                class="bg-linear-to-b absolute left-0 top-0 size-full from-transparent from-0% to-white to-55%"
                            >
                                <div class="absolute bottom-0 flex w-full flex-row items-center justify-center">
                                    <div>
                                        <KButton
                                            :label="`Show more (${getFormattedDistributions.length})`"
                                            @click="showAllDistributions"
                                        >
                                            <i class="icon-[ph--eye-fill]"></i>
                                        </KButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </UCard>
            </template>

            <template #additional-info>
                <div class="flex flex-row space-x-2 mb-4">
                    <SummaryBox v-if="(resultEnhanced?.getCategories?.length || 0) > 0" title="Categories">
                        <template #text>
                            <UBadge
                                v-for="category in resultEnhanced?.getCategories"
                                :key="category.id"
                                size="sm"
                                variant="soft"
                            >
                                {{ getLocalizedValue({ obj: category.label, fallbackLocale: 'en' }) }}
                            </UBadge>
                        </template>
                    </SummaryBox>
                </div>

                <PropertyTable
                    v-if="isSuccess"
                    :node="{
                        type: 'node',
                        id: 'a',
                        label: 'a',
                        data: resultEnhanced?.getPropertyTable2 || undefined,
                    }"
                />
            </template>
        </DetailsPage>
    </div>
</template>
