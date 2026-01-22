<script setup lang="ts">
// import { useVModel } from '@vueuse/core';
// import { computed, unref } from 'vue';

// import type { FacetList } from '../../utils/types';
// import Typography from '../base/typography/Typography.vue';
// import KInteractiveChip from '../interactive-chip/KInteractiveChip.vue';
import { useSearchParams } from '@/pages/catalog/useSearchParams';

const { queryParams } = useSearchParams();

const props = defineProps<{
    facets: FacetList<string>;
    modelValue: Record<string, string[]>;
}>();

const route = useRoute();
const pistisMode = route.query.pm;

const emit = defineEmits(['update:modelValue']);

const selectedFacets = useVModel(props, 'modelValue', emit, { passive: true });

function resolveFacetValueToLabel(facetId: string, value: string) {
    const facet = unref(props.facets).find((f) => f.id === facetId);
    if (!facet) return value;
    const facetValue = facet.items.find((f) => f.value === value);
    return facetValue?.label || value;
}

function resolveFacetTitleById(facetId: string) {
    return unref(props.facets).find((f) => f.id === facetId)?.label;
}

const flattenedSelectedFacets = computed(() => {
    const facets = Object.entries(unref(selectedFacets))
        .reduce(
            (acc, [key, value]) => {
                if (Array.isArray(value) && value.length) {
                    acc.push({
                        title: key,
                        values: value,
                    });
                }
                return acc;
            },
            [] as { title: string; values: string[] }[],
        )
        .filter((facet) => !(pistisMode === 'cloud' && facet.title === 'catalog'))
        .flatMap((facet) => {
            return facet.values.map((value) => {
                return {
                    title: facet.title,
                    label: resolveFacetTitleById(facet.title),
                    value: resolveFacetValueToLabel(facet.title, value),
                    id: value,
                };
            });
        });
    if (queryParams.dataServices.value === 'true') {
        facets.push({
            title: 'dataServices',
            label: 'Streaming Datasets',
            value: 'streaming datasets',
            id: 'true',
        });
    }

    return facets;
});

function removeSelectedFacetById(facetId: string, value: string) {
    if (facetId === 'dataServices') {
        queryParams.dataServices.value = 'false';
        return;
    }

    const unwrapSelectedFacets = unref(selectedFacets);
    if (!Object.keys(unwrapSelectedFacets).includes(facetId)) return;

    const typeSafeFacetId = facetId as keyof typeof unwrapSelectedFacets;
    const selectedFacet = unwrapSelectedFacets[typeSafeFacetId];
    if (Array.isArray(selectedFacet)) {
        // splice in a reactive friendly way
        unwrapSelectedFacets[typeSafeFacetId] = unwrapSelectedFacets[typeSafeFacetId].filter((v) => v !== value);
    }
}

function beforeLeave(el: any) {
    const { marginLeft, marginTop, width, height } = window.getComputedStyle(el);

    el.style.left = `${el.offsetLeft - Number.parseFloat(marginLeft)}px`;
    el.style.top = `${el.offsetTop - Number.parseFloat(marginTop)}px`;
    el.style.width = width;
    el.style.height = height;
}

function clearAllFacets() {
    const unwrapSelectedFacets = unref(selectedFacets);

    for (const key of Object.keys(unwrapSelectedFacets)) {
        if (pistisMode === 'cloud' && key === 'catalog') continue;
        unwrapSelectedFacets[key] = [];
    }

    queryParams.dataServices.value = 'false';
}
</script>

<template>
    <div class="relative w-full mt-4 mb-2">
        <transition-group
            enter-active-class="transform-gpu transition-all"
            enter-from-class="opacity-0 scale-50"
            enter-to-class=""
            move-class="transform-gpu transition-all"
            leave-active-class="absolute transform-gpu transition-all"
            leave-from-class=""
            leave-to-class="opacity-0 scale-50"
            tag="div"
            class="relative flex w-full flex-row flex-wrap gap-2"
            @before-leave="beforeLeave"
        >
            <div v-for="facet in flattenedSelectedFacets" :key="`selected-facet-${facet.title}-${facet.value}`">
                <KInteractiveChip
                    :id="`selected-facet-${facet.title}-${facet.value}`"
                    :id-name="`selected-facet-${facet.title}-${facet.value}`"
                    class="bg-pistis-50 rounded border border-pistis-200"
                    @click="removeSelectedFacetById(facet.title, facet.id)"
                >
                    <div class="flex flex-row flex-nowrap items-center gap-1 whitespace-nowrap">
                        <Typography>{{ facet.label || facet.title }}:</Typography>
                        <Typography variant="paragraph-1">
                            {{ facet.value }}
                        </Typography>
                    </div>
                </KInteractiveChip>
            </div>
            <div v-if="flattenedSelectedFacets.length > 0">
                <UButton variant="solid" class="self-start" @click="clearAllFacets">Clear all</UButton>
            </div>
        </transition-group>
    </div>
</template>
