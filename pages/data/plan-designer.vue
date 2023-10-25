<script setup lang="ts">
import { z } from 'zod';

//data for selected dataset

const selected = ref('');

//data for selection whole dataset or query

const completeOrQuery = ref('');

// FAIR data valuation suggestions data

const oneOffPrice = ref(500);
const subscriptionPrice = ref(20);

// data for asset offering details

const assetOfferingDetails = ref({
    title: '',
    description: '',
    keywords: [],
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

const reset = () => {
    console.log('RESET');
    selected.value = '';
    completeOrQuery.value = '';
    monetizationSelection.value = '';
    assetOfferingDetails.value = {
        title: '',
        description: '',
        keywords: [],
    };
};
</script>

<template>
    <div class="w-full h-full text-gray-700">
        <h1 class="text-2xl font-bold">
            {{ $t('data.designer') }}
        </h1>

        <DatasetSelector
            :selected="selected"
            :complete-or-query="completeOrQuery"
            @update:selected="(value: string) => (selected = value)"
            @update:complete-or-query="(value: string) => (completeOrQuery = value)"
            @reset="reset"
        />

        <AssetOfferingDetails
            v-model:assetOfferingDetails="assetOfferingDetails"
            :complete-or-query="completeOrQuery"
            @update:title="(value: string) => (assetOfferingDetails.title = value)"
            @update:description="(value: string) => (assetOfferingDetails.description = value)"
            @update:keywords="(value: string[]) => (assetOfferingDetails.keywords = value)"
        />

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
