<script setup lang="ts">
import { z } from 'zod';

import dummyData from './dummy-data';

//data for selecting specific dataset

const selections = Object.keys(dummyData);

const selected = ref<string>('');

const changeSelection = (value: string) => (selected.value = value);

const showFileBrowser = ref<boolean>(false);

const filteredSelections = computed(() =>
    outerQuery.value ? selections.filter((selection: string) => selection.includes(outerQuery.value)) : selections,
);

const outerQuery = ref('');

//data for selection whole dataset or query

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

// FAIR data valuation suggestions data

const oneOffPrice = ref(500);
const subscriptionPrice = ref(20);

// data for asset offering details

const assetOfferingDetails = ref({
    title: undefined,
    description: undefined,
    keywords: undefined,
});

const assetOfferingSchema = z.object({
    title: z.string().min(10, 'Must be at least 10 characters'),
    description: z.string().min(20, 'Must be at least 20 characters'),
    keywords: z.string(),
});

// data for monetization selections

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

// one-off sale details
const oneOffSaleDetails = ref({
    price: undefined,
    license: undefined,
    terms: undefined,
    limitNumber: undefined,
    limitFrequency: undefined,
});

const oneOffSaleSchema = z.object({
    price: z.coerce
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gte(0, 'Price must be 0 or a positive number'),
    license: z.string(),
    terms: z.string().min(20, 'Must be at least 20 characters'),
    limitNumber: z.coerce
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gte(0, 'Limit number must be 0 or a positive number'),
    limitFrequency: z.string(),
});

const licenseSelections = ['CC-BY', 'MIT', 'CC0'];

const frequencySelections = ['per day', 'per week', 'per month', 'per year'];

// clear data when switching selection of dataset

watch(selected, () => {
    completeOrQuery.value = '';
    monetizationSelection.value = '';
    assetOfferingDetails.value = {
        title: undefined,
        description: undefined,
        keywords: undefined,
    };
});
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
                <UForm
                    class="flex flex-col gap-4 mt-6 w-[450px]"
                    :state="assetOfferingDetails"
                    :schema="assetOfferingSchema"
                >
                    <UFormGroup label="Title" required name="title" class="h-[75px]">
                        <UInput v-model="assetOfferingDetails.title" placeholder="Title of the asset" />
                    </UFormGroup>
                    <UFormGroup label="Description" required name="description" class="h-[115px]">
                        <UTextarea
                            v-model="assetOfferingDetails.description"
                            placeholder="Type a description for the asset here"
                            icon="i-heroicons-envelope"
                        />
                    </UFormGroup>
                    <UFormGroup label="Keywords" required name="keywords" class="h-[75px]">
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
                <Transition
                    enter-active-class="duration-300 ease-out"
                    enter-from-class="transform opacity-0"
                    enter-to-class="opacity-100"
                    leave-active-class="duration-300 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="transform opacity-0"
                >
                    <UForm
                        v-if="monetizationSelection === 'One-off Sale'"
                        class="flex flex-col gap-4 mt-6 w-[450px]"
                        :state="oneOffSaleDetails"
                        :schema="oneOffSaleSchema"
                    >
                        <UFormGroup label="One-off Sale Price" required name="price" class="h-[75px]">
                            <UInput v-model="oneOffSaleDetails.price" placeholder="Price of the asset" type="numeric">
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">STC</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup label="License" required name="license" class="h-[75px]">
                            <USelectMenu
                                v-model="oneOffSaleDetails.license"
                                placeholder="Select a license"
                                :options="licenseSelections"
                            />
                        </UFormGroup>
                        <UFormGroup label="Terms and Conditions" required name="terms" class="h-[115px]">
                            <UTextarea
                                v-model="oneOffSaleDetails.terms"
                                placeholder="Type the terms and conditions of your license here"
                                icon="i-heroicons-envelope"
                            />
                        </UFormGroup>
                        <div class="flex gap-4 items-start h-20">
                            <UFormGroup label="Download limit" required name="limitNumber" class="w-80">
                                <UInput
                                    v-model="oneOffSaleDetails.limitNumber"
                                    placeholder="number of times allowed"
                                    type="numeric"
                                >
                                    <template #trailing>
                                        <span class="text-gray-500 text-xs">times</span>
                                    </template>
                                </UInput>
                            </UFormGroup>
                            <UFormGroup label="Frequency" required name="limitFrequency">
                                <USelectMenu
                                    v-model="oneOffSaleDetails.limitFrequency"
                                    placeholder="Select a frequency"
                                    :options="frequencySelections"
                                />
                            </UFormGroup>
                        </div>
                    </UForm>
                </Transition>
            </UCard>
        </Transition>
    </div>
</template>
