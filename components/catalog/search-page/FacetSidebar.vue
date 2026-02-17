<script setup lang="ts">
// import { useVModel } from '@vueuse/core';
// import { toRefs } from 'vue';
// import { useI18n } from 'vue-i18n';

import type { FacetList } from '@/utils/types';
// import KFacetGroup from '../base/facet-group/KFacetGroup.vue';
import PhCaretUp from '~icons/ph/caret-up';

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

const additionalFilters = computed(() => [
    {
        id: 'dataServices',
        label: 'Streaming Datasets',
        items: [],
    },
]);

const mergedFacetGroups = computed(() => {
    const result = [];
    const baseFacets = facets.value.filter((f) => f.items.length > 0);

    const hasMonetizationFacet = ref(false);

    for (const facet of baseFacets) {
        result.push(facet);

        if (facet.id === 'monetizationType') {
            result.push(...additionalFilters.value);
            hasMonetizationFacet.value = true;
        }
    }

    if (!hasMonetizationFacet.value) {
        result.push(...additionalFilters.value);
    }

    return result;
});

const emit = defineEmits(['update:modelValue']);

const { facets } = toRefs(props);

const model = useVModel(props, 'modelValue', emit, { passive: true });

const showAllFacets = ref(false);

const facetsCollapsed = 10;

const visibleFacetGroups = computed(() => {
    if (showAllFacets.value) {
        return mergedFacetGroups.value;
    }

    return mergedFacetGroups.value.slice(0, facetsCollapsed);
});

const hasMoreFacets = computed(() => {
    return mergedFacetGroups.value.length > facetsCollapsed;
});
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="ghost" class="h-[720px] w-full animate-pulse rounded-lg border bg-surface-200" />
        <template v-else>
            <div class="flex w-80 flex-col rounded bg-neutral-200 border border-neutral-300 shadow-md">
                <KFacetGroup
                    v-for="facet of visibleFacetGroups"
                    :id="`facet-group-${facet.id}`"
                    :key="facet.id"
                    v-model="model[facet.id]"
                    :title="facet.label"
                    :facets="facet.items"
                />
                <UButton v-if="hasMoreFacets" variant="soft" block @click="showAllFacets = !showAllFacets">
                    {{ showAllFacets ? 'Less filters' : 'More filters' }}
                    <PhCaretUp
                        class="text-lg font-semibold transition-transform duration-200 ease-in-out"
                        :class="{
                            'rotate-180': !showAllFacets,
                        }"
                    />
                </UButton>
            </div>
        </template>
    </div>
</template>
