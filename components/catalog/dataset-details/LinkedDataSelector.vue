<template>
    <nav>
        <!-- Linked Data link-->
        <div class="relative">
            <button class="text-nowrap cursor-pointer underline flex" aria-haspopup="listbox" @click="toggleDropdown">
                <span :title="$t('links.linkedData')" data-toggle="tooltip">
                    {{ $t('links.linkedData') }}
                    <component :is="PhCaretDown" class="inline" />
                </span>
            </button>
            <div
                v-if="showDropdown"
                class="absolute z-10 w-full top-full border dark:border rounded-md shadow-md bg-white dark:bg-surface-800 text-black dark:text-white/80 dark:border-surface-700 max-h-[200px]"
            >
                <ul class="w-full">
                    <li class="w-full hover:bg-pistis-200 p-1">
                        <component
                            :is="ResourceDetailsLinkedDataButton"
                            is-tooltip="true"
                            class="dropdown-item w-full"
                            format="rdf"
                            text="RDF/XML"
                            :resources="resource"
                            :resources-id="resourceId"
                        ></component>
                    </li>
                    <li class="w-full hover:bg-pistis-200 p-1">
                        <ResourceDetailsLinkedDataButton
                            is-tooltip="true"
                            class="dropdown-item"
                            format="ttl"
                            text="Turtle"
                            :resources="resource"
                            :resources-id="resourceId"
                        ></ResourceDetailsLinkedDataButton>
                    </li>
                    <li class="w-full hover:bg-pistis-200 p-1">
                        <ResourceDetailsLinkedDataButton
                            is-tooltip="true"
                            class="dropdown-item"
                            format="n3"
                            text="Notation3"
                            :resources="resource"
                            :resources-id="resourceId"
                        ></ResourceDetailsLinkedDataButton>
                    </li>
                    <li class="w-full hover:bg-pistis-200 p-1">
                        <ResourceDetailsLinkedDataButton
                            is-tooltip="true"
                            class="dropdown-item"
                            format="nt"
                            text="N-Triples"
                            :resources="resource"
                            :resources-id="resourceId"
                        ></ResourceDetailsLinkedDataButton>
                    </li>
                    <li class="w-full hover:bg-pistis-200 p-1">
                        <ResourceDetailsLinkedDataButton
                            is-tooltip="true"
                            class="dropdown-item"
                            format="jsonld"
                            text="JSON-LD"
                            :resources="resource"
                            :resources-id="resourceId"
                        ></ResourceDetailsLinkedDataButton>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';

import PhCaretDown from '~icons/ph/caret-down';

const ResourceDetailsLinkedDataButton = defineAsyncComponent(() => import('./ResourceDetailsLinkedDataButton.vue'));

const _props = defineProps({
    resourceId: {
        type: String,
        required: true,
    },
    resource: {
        type: String,
    },
});

const showDropdown = ref(false);

function toggleDropdown() {
    showDropdown.value = !showDropdown.value;
}
</script>

<style>
.dropdown-item :hover {
    background: var(--gray-hover);
}
</style>
