<script setup lang="ts">
import dummyData from './dummy-data';

const selections = Object.keys(dummyData);

const selected = ref<string>('');

const changeSelection = (value: string) => (selected.value = value);

const showFileBrowser = ref<boolean>(false);

const filteredSelections = computed(() =>
    outerQuery.value ? selections.filter((selection: string) => selection.includes(outerQuery.value)) : selections,
);

const outerQuery = ref('');

const completeOrQuery = ref('');

const changeDataSetSelection = (value: string) => (completeOrQuery.value = value);

const dataSetSelections = [
    {
        title: 'Complete Dataset',
        info: 'Select the complete dataset',
    },
    {
        title: 'Query / Filter',
        info: 'Select a subset of the dataset',
    },
];
</script>

<template>
    <div class="w-full h-full text-gray-700">
        <Heading :title="$t('data.designer')" />
        <div class="flex gap-4 items-center mt-8">
            <USelectMenu
                v-model="selected"
                icon="i-heroicons-magnifying-glass-20-solid"
                :searchable="
                    (query: string) => {
                        outerQuery = query;
                        return selections.filter((selection: string) => selection.includes(query));
                    }
                "
                searchable-placeholder="Search for a dataset..."
                class="w-full lg:w-72 relative"
                placeholder="Select / search for a dataset"
                :options="selections"
            />
            <UButton label="File Browser" @click="showFileBrowser = !showFileBrowser" />
        </div>

        <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="transform opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="transform opacity-0"
        >
            <FileBrowser
                v-show="showFileBrowser"
                :files="filteredSelections"
                :selected="selected"
                class="mt-8"
                @selection-changed="changeSelection"
            />
        </Transition>
        <div v-if="selected" class="flex gap-4 mt-8 max-w-lg text-sm">
            <div class="flex flex-col items-start justify-start gap-4 whitespace-nowrap">
                <p>Asset Title:</p>
                <p>Asset Description:</p>
            </div>
            <div class="flex flex-col items-start justify-start gap-4">
                <p class="font-bold">{{ selected }}</p>
                <p>{{ dummyData[selected].description }}</p>
            </div>
        </div>
        <SelectionCards class="mt-8" :selections="dataSetSelections" @selection-changed="changeDataSetSelection" />
    </div>
</template>
