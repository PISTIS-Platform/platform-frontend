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

const oneOffPrice = ref(500);
const subscriptionPrice = ref(20);

watch(selected, () => {
    completeOrQuery.value = '';
});

const assetOfferingDetails = ref({
    title: undefined,
    description: undefined,
    keywords: undefined,
});

const monetizationSelections = [
    {
        title: 'One-off Sale',
        info: 'Info here',
    },
    {
        title: 'Subscription',
        info: 'Info here',
    },
    {
        title: 'NFT',
        info: 'Info here',
    },
    {
        title: 'Investment Plan',
        info: 'Info here',
    },
];

const monetizationSelection = ref('');

const changeMonetizationSelection = (value: string) => (monetizationSelection.value = value);
</script>

<template>
    <div class="w-full h-full text-gray-700 text-sm">
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
            leave-active-class="duration-300 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="transform opacity-0"
        >
            <FileBrowser
                v-show="showFileBrowser"
                class="mt-8"
                :files="filteredSelections"
                :selected="selected"
                @selection-changed="changeSelection"
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
                v-if="selected"
                class="mt-8"
                :selections="dataSetSelections"
                :selected="completeOrQuery"
                @selection-changed="changeDataSetSelection"
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
            <UCard v-if="completeOrQuery" class="mt-8">
                <div class="flex gap-4 items-center">
                    <SubHeading title="FAIR Data Valuation Suggestions" info="Find out more here" />
                    <a href="" class="text-xs text-primary-500 underline">Learn More</a>
                </div>
                <div class="mt-6">
                    Suggested One-off Price: <span class="font-bold">{{ oneOffPrice }} STC</span>
                </div>
                <div class="mt-4">
                    Suggested Subscription Price: <span class="font-bold">{{ subscriptionPrice }} STC</span>
                </div>
            </UCard>
        </Transition>

        <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="transform opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-300 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="transform opacity-0"
        >
            <UCard v-if="completeOrQuery" class="mt-8">
                <SubHeading title="Asset Offering Details" info="Find out more here" />
                <UForm class="flex flex-col gap-4 mt-6 w-[450px]" :state="assetOfferingDetails">
                    <UFormGroup label="Title" required>
                        <UInput v-model="assetOfferingDetails.title" placeholder="Title of the asset" />
                    </UFormGroup>
                    <UFormGroup label="Description" required>
                        <UTextarea
                            v-model="assetOfferingDetails.description"
                            placeholder="Type a description for the asset here"
                            icon="i-heroicons-envelope"
                        />
                    </UFormGroup>
                    <UFormGroup label="Keywords" required>
                        <UInput
                            v-model="assetOfferingDetails.keywords"
                            placeholder="Type keywords separated by commas"
                        />
                    </UFormGroup>
                </UForm>
                <SubHeading class="mt-8" title="Monetization Method" info="Find out more here" />

                <SelectionCards
                    class="mt-6"
                    :selections="monetizationSelections"
                    :selected="monetizationSelection"
                    @selection-changed="changeMonetizationSelection"
                />
            </UCard>
        </Transition>
    </div>
</template>
