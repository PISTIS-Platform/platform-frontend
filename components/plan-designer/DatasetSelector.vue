<script setup lang="ts">
import dummyData from '../../pages/data/dummy-data';

const props = defineProps({
    selected: {
        type: String,
        required: true,
    },
    completeOrQuery: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['reset', 'update:selected', 'update:complete-or-query']);

//data for selecting specific dataset

const selections = Object.keys(dummyData);

const switchDatasetOpen = ref<boolean>(false);

const filteredSelections = computed(() =>
    outerQuery.value ? selections.filter((selection: string) => selection.includes(outerQuery.value)) : selections,
);

const outerQuery = ref('');

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
    <UCard class="mt-8">
        <template #header>
            <SubHeading
                title="Dataset Selection"
                info="Search for and select the dataset you wish to put on the market"
            />
        </template>

        <span
            v-if="props.selected"
            class="flex gap-2 items-center text-primary cursor-pointer w-60"
            @click="switchDatasetOpen = true"
        >
            <UIcon name="i-heroicons-arrow-left-20-solid" class="h-5 w-5" /> Select a different dataset</span
        >

        <UModal v-model="switchDatasetOpen">
            <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
                <p class="font-bold text-xl">Are you sure?</p>
                <p class="text-gray-400 mt-6">Any configuration you have made will be reset.</p>
                <div class="flex gap-8 w-full justify-center mt-6">
                    <UButton color="white" class="w-20 flex justify-center" @click="switchDatasetOpen = false"
                        >Cancel</UButton
                    >
                    <UButton class="w-20 flex justify-center" @click="emit('reset'), (switchDatasetOpen = false)"
                        >Yes</UButton
                    >
                </div>
            </UCard>
        </UModal>

        <USelectMenu
            v-if="!props.selected"
            :model-value="props.selected"
            icon="i-heroicons-magnifying-glass-20-solid"
            :searchable="
                (query: string) => {
                    outerQuery = query;
                    return selections.filter((selection: string) => selection.includes(query));
                }
            "
            searchable-placeholder="Search for a dataset..."
            class="w-full relative"
            placeholder="Select / search for a dataset"
            :options="selections"
            @update:model-value="(value: string) => emit('update:selected', value)"
        />

        <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="transform opacity-0"
            enter-to-class="opacity-100"
        >
            <FileBrowser
                v-if="!props.selected"
                :model-value="props.selected"
                class="mt-6"
                :files="filteredSelections"
                @update:model-value="(value: string) => emit('update:selected', value)"
            />
        </Transition>

        <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="transform opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-300 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="transform opacity-0"
        >
            <div v-if="props.selected" class="flex gap-4 mt-8 w-full">
                <div class="flex flex-col items-start justify-start gap-4 whitespace-nowrap">
                    <p>Asset Title:</p>
                    <p>Asset Description:</p>
                </div>
                <div class="flex flex-col items-start justify-start gap-4">
                    <p class="font-bold">{{ props.selected }}</p>
                    <p>{{ dummyData[props.selected].description }}</p>
                </div>
            </div>
        </Transition>

        <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="transform opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-300 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="transform opacity-0"
        >
            <SelectionCards
                v-if="props.selected"
                :model-value="completeOrQuery"
                class="mt-8"
                :selections="dataSetSelections"
                @update:model-value="(value: string) => emit('update:complete-or-query', value)"
            />
        </Transition>
    </UCard>
</template>
