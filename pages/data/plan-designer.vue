<script setup lang="ts">
import { z } from 'zod';

import dummyData from './dummy-data';

//data for selecting specific dataset

const selections = Object.keys(dummyData);

const selected = ref<string>('');

const switchDatasetOpen = ref<boolean>(false);

const filteredSelections = computed(() =>
    outerQuery.value ? selections.filter((selection: string) => selection.includes(outerQuery.value)) : selections,
);

const outerQuery = ref('');

//data for selection whole dataset or query

const completeOrQuery = ref('');

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

// one-off sale details
const oneOffSaleDetails = ref({
    price: undefined,
    license: undefined,
    terms: undefined,
    limitNumber: undefined,
    limitFrequency: undefined,
});

const oneOffSaleSchema = z.object({
    price: z
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gte(0, 'Price must be 0 or a positive number'),
    license: z.string(),
    terms: z.string().min(20, 'Must be at least 20 characters'),
    limitNumber: z
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gte(0, 'Limit number must be 0 or a positive number'),
    limitFrequency: z.string(),
});

const licenseSelections = ['CC-BY', 'MIT', 'CC0'];

const frequencySelections = ['per day', 'per week', 'per month', 'per year'];

// clear data when switching selection of dataset

watch(selected, () => {
    switchDatasetOpen.value = false;
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
    <div class="w-full h-full text-gray-700">
        <h1 class="text-2xl font-bold">
            {{ $t('data.designer') }}
        </h1>
        <UCard class="mt-8">
            <template #header>
                <SubHeading
                    title="Dataset Selection"
                    info="Search for and select the dataset you wish to put on the market"
                />
            </template>

            <span
                v-if="selected"
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
                        <UButton class="w-20 flex justify-center" @click="selected = ''">Yes</UButton>
                    </div>
                </UCard>
            </UModal>

            <USelectMenu
                v-if="!selected"
                v-model="selected"
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
            />

            <Transition
                enter-active-class="duration-300 ease-out"
                enter-from-class="transform opacity-0"
                enter-to-class="opacity-100"
            >
                <FileBrowser v-if="!selected" v-model="selected" class="mt-6" :files="filteredSelections" />
            </Transition>

            <Transition
                enter-active-class="duration-300 ease-out"
                enter-from-class="transform opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="duration-300 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="transform opacity-0"
            >
                <div v-if="selected" class="flex gap-4 mt-8 w-full">
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
                    v-model="completeOrQuery"
                    class="mt-8"
                    :selections="dataSetSelections"
                />
            </Transition>
        </UCard>

        <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="transform opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-300 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="transform opacity-0"
        >
            <UCard v-if="completeOrQuery" class="mt-8">
                <template #header>
                    <SubHeading title="Asset Offering Details" info="Find out more here" />
                </template>
                <UForm class="flex flex-col gap-4 w-full" :state="assetOfferingDetails" :schema="assetOfferingSchema">
                    <UFormGroup label="Title" required name="title">
                        <UInput v-model="assetOfferingDetails.title" placeholder="Title of the asset" />
                    </UFormGroup>
                    <UFormGroup label="Description" required name="description">
                        <UTextarea
                            v-model="assetOfferingDetails.description"
                            placeholder="Type a description for the asset here"
                            icon="i-heroicons-envelope"
                        />
                    </UFormGroup>
                    <UFormGroup label="Keywords" required name="keywords">
                        <UInput
                            v-model="assetOfferingDetails.keywords"
                            placeholder="Type keywords separated by commas"
                        />
                    </UFormGroup>
                </UForm>
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
            <UCard v-if="completeOrQuery" class="mt-8 bg-secondary-50 border border-secondary-500">
                <template #header>
                    <div class="flex justify-between gap-4 items-start">
                        <SubHeading title="FAIR Data Valuation Suggestions" info="Find out more here" />
                        <a href="" class="text-xs text-primary-500 underline">Learn More</a>
                    </div>
                </template>

                <div>
                    Suggested One-off Price: <span class="font-bold">{{ oneOffPrice }} STC</span>
                </div>
                <div class="mt-4">
                    Suggested Subscription Price: <span class="font-bold">{{ subscriptionPrice }} STC</span>
                </div>
            </UCard>
        </Transition>

        <UCard v-if="completeOrQuery" class="mt-8">
            <template #header>
                <SubHeading title="Monetization Method" info="Find out more here" />
            </template>

            <SelectionCards v-model="monetizationSelection" :selections="monetizationSelections" />
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
                    class="flex flex-col gap-4 mt-6 w-full"
                    :state="oneOffSaleDetails"
                    :schema="oneOffSaleSchema"
                >
                    <UFormGroup label="One-off Sale Price" required name="price">
                        <UInput
                            v-model.number="oneOffSaleDetails.price"
                            placeholder="Price of the asset"
                            type="numeric"
                        >
                            <template #trailing>
                                <span class="text-gray-500 text-xs">STC</span>
                            </template>
                        </UInput>
                    </UFormGroup>
                    <UFormGroup label="License" required name="license">
                        <USelectMenu
                            v-model="oneOffSaleDetails.license"
                            placeholder="Select a license"
                            :options="licenseSelections"
                        />
                    </UFormGroup>
                    <UFormGroup label="Terms and Conditions" required name="terms">
                        <UTextarea
                            v-model="oneOffSaleDetails.terms"
                            placeholder="Type the terms and conditions of your license here"
                            icon="i-heroicons-envelope"
                        />
                    </UFormGroup>
                    <div class="flex gap-4 items-start h-20 w-full">
                        <UFormGroup label="Download limit" required name="limitNumber" class="w-full">
                            <UInput
                                v-model.number="oneOffSaleDetails.limitNumber"
                                placeholder="number of times allowed"
                                type="numeric"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">times</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup label="Frequency" required name="limitFrequency" class="w-full">
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
    </div>
</template>
