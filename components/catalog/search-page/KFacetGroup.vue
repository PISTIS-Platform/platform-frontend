<script lang="ts" setup>
import type { PanelProps } from 'primevue/panel';
import Panel from 'primevue/panel';

import { useDataTruncator } from '@/composables/useDataTruncator';
import PhCaretDown from '~icons/ph/caret-down';
import PhCaretUp from '~icons/ph/caret-up';

// import type { Facet } from '../../../utils/types';
// import Typography from '../typography/Typography.vue';

const props = defineProps<{
    title?: string;
    facets: Facet[];
}>();

defineSlots<{
    header: (props: { title?: string }) => any;
}>();

const route = useRoute();
const pistisMode = route.query.pm;

const config = useRuntimeConfig();

const model = defineModel<string[]>();

const collapsed = defineModel<boolean>('collapsed');

const displayedFacets = props.facets.length > 5 ? 5 : props.facets.length;

const {
    data: truncatedFacets,
    toggle: toggleFacetsTruncation,
    isTruncated,
    isTruncationNeeded,
} = useDataTruncator<Facet>({
    data: props.facets,
    limit: displayedFacets,
});

const allInvestOffers = ['true', 'false'];
const isOn = ref(false);
function toggleSlider() {
    isOn.value = !isOn.value;
    model.value = isOn.value ? allInvestOffers : [];
}

const panelPreset = {
    header: ({ props }: { props: PanelProps }) => ({
        class: [
            // Flex
            'flex items-center justify-between',
            // Colors
            'text-surface-700 dark:text-surface-0/80',
            'bg-transparent',
            // 'border border-surface-200 dark:border-surface-700',
            'border-b border-neutral-300',
            // Shape
            // 'rounded-tl-lg rounded-tr-lg',
            // Conditional Spacing
            { 'px-3 py-1': props.toggleable },
        ],
    }),
    title: {
        class: 'leading-none font-bold',
    },
    toggler: {
        class: [
            'inline-flex items-center justify-center',
            'relative',
            'w-8 h-8',
            'm-0 p-0',
            'border-0 rounded-full',
            'bg-transparent',
            'text-surface-600 dark:text-surface-0/80',
            'focus:outline-hidden focus:outline-offset-0 focus-visible:ring-3 focus-visible:ring-primary-400/50 focus-visible:ring-inset dark:focus-visible:ring-primary-300/50',
            'transition-all duration-200 ease-in-out',
            'overflow-hidden no-underline',
            'cursor-pointer',
        ],
    },
    togglerIcon: {
        class: 'inline-block',
    },
    content: {
        class: ['text-surface-700 dark:text-surface-0/80'],
    },
    footer: {
        class: [
            'py-3 p-5',
            'border border-t-0 rounded-br-lg rounded-bl-lg',
            'border-surface-200 dark:border-surface-700',
            'text-surface-700 dark:text-surface-0/80',
        ],
    },
    transition: {
        enterFromClass: 'max-h-0',
        enterActiveClass: 'overflow-hidden transition-[max-height] duration-1000 ease-[cubic-bezier(0.42,0,0.58,1)]',
        enterToClass: 'max-h-[1000px]',
        leaveFromClass: 'max-h-[1000px]',
        leaveActiveClass: 'overflow-hidden transition-[max-height] duration-[450ms] ease-[cubic-bezier(0,1,0,1)]',
        leaveToClass: 'max-h-0',
    },
};

onMounted(() => {
    if (pistisMode === 'cloud' && props.title === 'Catalogues') {
        model.value = [config.public.pistisMarketplaceCatalog];
    }
});
</script>

<template>
    <Panel
        v-if="!(pistisMode === 'cloud' && props.title === 'Catalogues')"
        v-model:collapsed="collapsed"
        class="flex min-w-64 flex-col text-surface-text"
        :pt="panelPreset"
        :pt-options="{ mergeSections: true, mergeProps: false }"
        toggleable
    >
        <template #header>
            <div class="flex w-full flex-col justify-center gap-2">
                <slot name="header" :title="props.title">
                    <Typography
                        variant="by-heading-6"
                        class="flex flex-row justify-between text-surface-text font-medium"
                    >
                        {{ title }}
                        <!-- <PhCaretDown class="text-lg font-semibold" /> -->
                    </Typography>
                </slot>
            </div>
        </template>
        <template #togglericon="{ collapsed }">
            <PhCaretDown
                class="text-lg font-semibold transition-transform duration-200 ease-in-out"
                :class="{
                    'rotate-180': !collapsed,
                }"
            />
        </template>
        <div
            v-if="props.title === 'Investment Offer'"
            class="flex justify-between items-center py-3 text-surface-text px-3 text-sm border-b border-surface-200"
            :class="{
                'border-b border-b-primary bg-primary-light font-semibold': isOn,
            }"
        >
            <Typography class="text-sm" :class="{ 'font-semibold': isOn }">all investment offers</Typography>
            <label class="switch">
                <button class="slider round" :class="{ active: isOn }" @click="toggleSlider"></button>
            </label>
        </div>
        <div v-if="!(props.title === 'Investment Offer' && isOn)" class="flex-1 border-b border-neutral-300">
            <ul class="flex flex-col divide-y border-neutral-50">
                <li v-for="(facet, i) in truncatedFacets" :key="i">
                    <label class="relative">
                        <input
                            :id="facet.id"
                            v-model="model"
                            class="peer absolute left-0 top-0 size-0 opacity-0"
                            type="checkbox"
                            :value="facet.id"
                            :name="facet.label"
                        />
                        <div
                            class="max-h-12 w-full py-3"
                            :class="{
                                'text-surface-text hover:bg-neutral-20': !model?.includes(facet.id),
                                'border-b border-b-primary bg-primary-light font-semibold': model?.includes(facet.id),
                            }"
                            :name="facet.label"
                            :value="facet.value || facet.id"
                        >
                            <div
                                class="flex flex-1 flex-row text-surface-text flex-nowrap items-center justify-between cursor-pointer px-3"
                            >
                                <div class="truncate text-sm">
                                    {{ facet.label }}
                                </div>
                                <Typography
                                    class="font-normal text-primary-600 bg-primary-50 border-primary-100 border px-2 rounded text-sm"
                                    as="div"
                                    variant="button-text"
                                >
                                    {{ facet.count }}
                                </Typography>
                            </div>
                        </div>
                    </label>
                </li>
                <li v-if="isTruncationNeeded">
                    <button
                        class="grid max-h-12 w-full place-content-center border-t-0 bg-neutral-50 cursor-pointer rounded-b-lg py-1"
                        @click="toggleFacetsTruncation"
                    >
                        <PhCaretDown v-if="isTruncated" />
                        <PhCaretUp v-else />
                    </button>
                </li>
            </ul>
        </div>
    </Panel>
</template>

<style>
.p-panel-content {
    @apply rounded-none p-0 border-0;
}

.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;
}

.slider {
    position: relative;
    cursor: pointer;
    background-color: #ccc;
    border: none;
    border-radius: 34px;
    width: 100%;
    height: 100%;
    transition: background-color 0.4s;
    padding: 0;
}

.slider::before {
    content: '';
    position: absolute;
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.4s;
}

.slider.active {
    @apply bg-primary-500;
}

.slider.active::before {
    transform: translateX(18px);
}
</style>
