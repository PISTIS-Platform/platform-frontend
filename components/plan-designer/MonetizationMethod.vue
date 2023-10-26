<script setup lang="ts">
import { z } from 'zod';

const props = defineProps({
    completeOrQuery: {
        type: String,
        required: true,
    },
    oneOffSaleDetails: {
        type: Object,
        required: true,
    },
    subscriptionDetails: {
        type: Object,
        required: true,
    },
    monetizationSelection: {
        type: String,
        required: true,
    },
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

const licenseSelections = ['CC-BY', 'MIT', 'CC0'];

const limitFrequencySelections = ['per day', 'per week', 'per month', 'per year'];

const frequencySelections = ['Monthly', 'Annual'];

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

const subscriptionSchema = z.object({
    frequency: z.string(),
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

const emit = defineEmits([
    'update:monetization-selection',
    'update:oneoff-price',
    'update:oneoff-license',
    'update:oneoff-terms',
    'update:oneoff-limit-number',
    'update:oneoff-limit-frequency',
    'update:sub-frequency',
    'update:sub-price',
    'update:sub-license',
    'update:sub-terms',
    'update:sub-limit-number',
    'update:sub-limit-frequency',
]);
</script>

<template>
    <Transition
        enter-active-class="duration-300 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
    >
        <UCard v-if="props.completeOrQuery" class="mt-8">
            <template #header>
                <SubHeading title="Monetization Method" info="Find out more here" />
            </template>

            <SelectionCards
                :model-value="props.monetizationSelection"
                :selections="monetizationSelections"
                @update:model-value="(value: string) => emit('update:monetization-selection', value)"
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
                    v-if="props.monetizationSelection === 'One-off Sale'"
                    class="flex flex-col gap-4 mt-6 w-full"
                    :state="props.oneOffSaleDetails"
                    :schema="oneOffSaleSchema"
                >
                    <UFormGroup label="One-off Sale Price" required name="price">
                        <UInput
                            :model-value="props.oneOffSaleDetails.price"
                            placeholder="Price of the asset"
                            type="numeric"
                            @update:model-value="(value: string) => emit('update:oneoff-price', value)"
                        >
                            <template #trailing>
                                <span class="text-gray-500 text-xs">STC</span>
                            </template>
                        </UInput>
                    </UFormGroup>
                    <UFormGroup label="License" required name="license">
                        <USelect
                            :model-value="props.oneOffSaleDetails.license"
                            placeholder="Select a license"
                            :options="licenseSelections"
                            @update:model-value="(value: string) => emit('update:oneoff-license', value)"
                        />
                    </UFormGroup>
                    <UFormGroup label="Terms and Conditions" required name="terms">
                        <UTextarea
                            :model-value="props.oneOffSaleDetails.terms"
                            placeholder="Type the terms and conditions of your license here"
                            icon="i-heroicons-envelope"
                            @update:model-value="(value: string) => emit('update:oneoff-terms', value)"
                        />
                    </UFormGroup>
                    <div class="flex gap-4 items-start h-20 w-full">
                        <UFormGroup label="Download limit" required name="limitNumber" class="w-full">
                            <UInput
                                :model-value="props.oneOffSaleDetails.limitNumber"
                                placeholder="number of times allowed"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:oneoff-limit-number', value)"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">times</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup label="Frequency" required name="limitFrequency" class="w-full">
                            <USelectMenu
                                :model-value="props.oneOffSaleDetails.limitFrequency"
                                placeholder="Select a frequency"
                                :options="limitFrequencySelections"
                                @update:model-value="(value: string) => emit('update:oneoff-limit-frequency', value)"
                            />
                        </UFormGroup>
                    </div>
                </UForm>
            </Transition>

            <Transition
                enter-active-class="duration-300 ease-out"
                enter-from-class="transform opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="duration-300 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="transform opacity-0"
            >
                <UForm
                    v-if="props.monetizationSelection === 'Subscription'"
                    class="flex flex-col gap-4 mt-6 w-full"
                    :state="props.subscriptionDetails"
                    :schema="subscriptionSchema"
                >
                    <UFormGroup label="Subscription Frequency" required name="frequency">
                        <USelectMenu
                            :model-value="props.subscriptionDetails.frequency"
                            placeholder="Select a frequency"
                            :options="frequencySelections"
                            @update:model-value="(value: string) => emit('update:sub-frequency', value)"
                        />
                    </UFormGroup>
                    <UFormGroup label="Subscription Price" required name="price">
                        <UInput
                            :model-value="props.subscriptionDetails.price"
                            placeholder="Price of the asset"
                            type="numeric"
                            @update:model-value="(value: string) => emit('update:sub-price', value)"
                        >
                            <template #trailing>
                                <span class="text-gray-500 text-xs">STC</span>
                            </template>
                        </UInput>
                    </UFormGroup>
                    <UFormGroup label="License" required name="license">
                        <USelect
                            :model-value="props.subscriptionDetails.license"
                            placeholder="Select a license"
                            :options="licenseSelections"
                            @update:model-value="(value: string) => emit('update:sub-license', value)"
                        />
                    </UFormGroup>
                    <UFormGroup label="Terms and Conditions" required name="terms">
                        <UTextarea
                            :model-value="props.subscriptionDetails.terms"
                            placeholder="Type the terms and conditions of your license here"
                            icon="i-heroicons-envelope"
                            @update:model-value="(value: string) => emit('update:sub-terms', value)"
                        />
                    </UFormGroup>
                    <div class="flex gap-4 items-start h-20 w-full">
                        <UFormGroup label="Download limit" required name="limitNumber" class="w-full">
                            <UInput
                                :model-value="props.subscriptionDetails.limitNumber"
                                placeholder="number of times allowed"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:sub-limit-number', value)"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">times</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup label="Frequency" required name="limitFrequency" class="w-full">
                            <USelectMenu
                                :model-value="props.subscriptionDetails.limitFrequency"
                                placeholder="Select a frequency"
                                :options="limitFrequencySelections"
                                @update:model-value="(value: string) => emit('update:sub-limit-frequency', value)"
                            />
                        </UFormGroup>
                    </div>
                </UForm>
            </Transition>
        </UCard>
    </Transition>
</template>
