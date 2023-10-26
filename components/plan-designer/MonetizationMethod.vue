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
    investmentPlanDetails: {
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

const investmentPlans = ref({
    Title1: {
        title: 'Title1',
        totalEqPercentage: 20,
        minEqPercentage: 10,
        eqPrice: 500,
        maxNoInvestors: 20,
    },
    'Title 2': {
        title: 'Title 2',
        totalEqPercentage: 30,
        minEqPercentage: 5,
        eqPrice: 350,
        maxNoInvestors: 5,
    },
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

const investmentSchema = z.object({
    title: z.string(),
    totalEqPercentage: z.coerce
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gt(0, 'Total equity percentage must be a positive number'),
    minEqPercentage: z.coerce
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gt(0, 'Minimum equity percentage must be a positive number'),
    eqPrice: z.coerce
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gt(0, 'Equity price must be a positive number'),
    maxNoInvestors: z.coerce
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gt(0, 'Max number of investors must be a positive number'),
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
    'update:plan-title',
    'update:plan-total-eq-percentage',
    'update:plan-min-eq-percentage',
    'update:plan-eq-price',
    'update:plan-max-no-investors',
    'update:selected-investment-plan',
]);

const updateInvestmentPlan = (title: string) => {
    showCreatePlan.value = false;
    const obj = investmentPlans.value[title];

    emit('update:plan-title', obj.title);
    emit('update:plan-total-eq-percentage', obj.totalEqPercentage);
    emit('update:plan-min-eq-percentage', obj.minEqPercentage);
    emit('update:plan-eq-price', obj.eqPrice);
    emit('update:plan-max-no-investors', obj.maxNoInvestors);
};

const investmentPlanTitles = computed(() => Object.keys(investmentPlans.value));

const selectedInvestmentPlan = ref('');

const showCreatePlan = ref(false);

const createNewPlan = () => {
    showCreatePlan.value = true;
    selectedInvestmentPlan.value = '';
    emit('update:plan-title', '');
    emit('update:plan-total-eq-percentage', undefined);
    emit('update:plan-min-eq-percentage', undefined);
    emit('update:plan-eq-price', undefined);
    emit('update:plan-max-no-investors', undefined);
};

const editPlan = () => {
    showCreatePlan.value = true;
};

const saveInvestmentPlan = () => {
    investmentPlans.value[props.investmentPlanDetails.title] = {
        title: props.investmentPlanDetails.title,
        totalEqPercentage: props.investmentPlanDetails.totalEqPercentage,
        minEqPercentage: props.investmentPlanDetails.minEqPercentage,
        eqPrice: props.investmentPlanDetails.eqPrice,
        maxNoInvestors: props.investmentPlanDetails.maxNoInvestors,
    };
    showCreatePlan.value = false;
    selectedInvestmentPlan.value = props.investmentPlanDetails.title;
};
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
                        <USelectMenu
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
                        <USelectMenu
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
            <Transition
                enter-active-class="duration-300 ease-out"
                enter-from-class="transform opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="duration-300 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="transform opacity-0"
            >
                <div class="mt-6">
                    <div class="flex flex-col gap-4">
                        <UFormGroup
                            v-if="props.monetizationSelection === 'Investment Plan'"
                            label="Search For / Select / Edit / Create new plan"
                        >
                            <div class="flex items-center gap-4">
                                <USelectMenu
                                    v-model="selectedInvestmentPlan"
                                    icon="i-heroicons-magnifying-glass-20-solid"
                                    searchable
                                    searchable-placeholder="Search for a Data Investment Plan..."
                                    class="w-full relative"
                                    placeholder="Search for / select a Data Investment Plan"
                                    :options="investmentPlanTitles"
                                    @update:model-value="(value: string) => updateInvestmentPlan(value)"
                                />
                                <span v-if="selectedInvestmentPlan"> or</span>
                                <span
                                    v-if="selectedInvestmentPlan"
                                    class="cursor-pointer text-primary-500 whitespace-nowrap"
                                    @click="editPlan"
                                >
                                    edit plan
                                </span>
                                <span> or </span>
                                <span class="cursor-pointer text-primary-500 whitespace-nowrap" @click="createNewPlan">
                                    create new plan
                                </span>
                            </div>
                        </UFormGroup>
                        <div v-if="selectedInvestmentPlan && !showCreatePlan" class="flex flex-col gap-4">
                            <p>
                                Investment Plan Title:
                                <span class="font-bold">{{ investmentPlans[selectedInvestmentPlan].title }}</span>
                            </p>
                            <p>
                                Total Equity Percentage:
                                <span class="font-bold"
                                    >{{ investmentPlans[selectedInvestmentPlan].totalEqPercentage }}%</span
                                >
                            </p>
                            <p>
                                Min Equity Percentage:
                                <span class="font-bold"
                                    >{{ investmentPlans[selectedInvestmentPlan].minEqPercentage }}%</span
                                >
                            </p>
                            <p>
                                Equity Price:
                                <span class="font-bold">{{ investmentPlans[selectedInvestmentPlan].eqPrice }} STC</span>
                            </p>
                            <p>
                                Max No of investors:
                                <span class="font-bold"
                                    >{{ investmentPlans[selectedInvestmentPlan].maxNoInvestors }} investors</span
                                >
                            </p>
                        </div>
                    </div>
                    <UForm
                        v-if="props.monetizationSelection === 'Investment Plan' && showCreatePlan"
                        class="flex flex-col gap-4 mt-6 w-full"
                        :state="props.investmentPlanDetails"
                        :schema="investmentSchema"
                    >
                        <UFormGroup label="Investment Plan Title" required name="title">
                            <UInput
                                :model-value="props.investmentPlanDetails.title"
                                placeholder="Title of the investment plan"
                                @update:model-value="(value: string[]) => emit('update:plan-title', value)"
                            />
                        </UFormGroup>
                        <UFormGroup label="Total Equity Percentage" required name="totalEqPercentage">
                            <UInput
                                :model-value="props.investmentPlanDetails.totalEqPercentage"
                                placeholder="Percentage"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:plan-total-eq-percentage', value)"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">%</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup label="Minimum Equity Percentage" required name="minEqPercentage">
                            <UInput
                                :model-value="props.investmentPlanDetails.minEqPercentage"
                                placeholder="Percentage"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:plan-min-eq-percentage', value)"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">%</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup label="Equity Price" required name="eqPrice">
                            <UInput
                                :model-value="props.investmentPlanDetails.eqPrice"
                                placeholder="Price"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:plan-eq-price', value)"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">STC</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup label="Max number of investors" required name="maxNoInvestors">
                            <UInput
                                :model-value="props.investmentPlanDetails.maxNoInvestors"
                                placeholder="Number of investors"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:plan-max-no-investors', value)"
                            >
                            </UInput>
                        </UFormGroup>
                        <UButton color="white" class="w-44 flex justify-center items-center" @click="saveInvestmentPlan"
                            >Save Investment Plan</UButton
                        >
                    </UForm>
                </div>
            </Transition>
        </UCard>
    </Transition>
</template>
