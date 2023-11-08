<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();

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
    NFTDetails: {
        type: Object,
        required: true,
    },
    monetizationSelection: {
        type: String,
        required: true,
    },
    isAllValid: {
        type: Boolean,
        required: true,
    },
});

const monetizationSelections = [
    {
        title: t('data.designer.oneOffSale'),
        info: t('data.designer.oneOffSaleInfo'),
    },
    {
        title: t('data.designer.subscription'),
        info: t('data.designer.subscriptionInfo'),
    },
    {
        title: t('data.designer.nft'),
        info: t('data.designer.nftInfo'),
    },
    {
        title: t('data.designer.investmentPlan'),
        info: t('data.designer.investmentPlanInfo'),
    },
];

const licenseSelections = ['CC-BY', 'MIT', 'CC0'];

const limitFrequencySelections = computed(() => [t('perDay'), t('perWeek'), t('perMonth'), t('perYear')]);

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
    price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
    license: z.string(),
    terms: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
    limitNumber: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
    limitFrequency: z.string(),
});

const subscriptionSchema = z.object({
    frequency: z.string(),
    price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
    license: z.string(),
    terms: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
    limitNumber: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
    limitFrequency: z.string(),
});

const investmentSchema = z.object({
    title: z.string().min(10, t('val.atLeastNumberChars', { count: 10 })),
    totalEqPercentage: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
    minEqPercentage: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
    eqPrice: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
    maxNoInvestors: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
});

const NFTschema = z.object({
    price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
});

const isOneOffSaleDetailsValid = computed(() => {
    return oneOffSaleSchema.safeParse(props.oneOffSaleDetails).success;
});
const isSubscriptionDetailsValid = computed(() => {
    return subscriptionSchema.safeParse(props.subscriptionDetails).success;
});
const isNFTDetailsValid = computed(() => {
    return NFTschema.safeParse(props.NFTDetails).success;
});
const isInvestmentPlanDetailsValid = computed(() => {
    return investmentSchema.safeParse(props.investmentPlanDetails).success;
});

const isMonetizationValid = computed(() => {
    if (props.monetizationSelection === t('data.designer.oneOffSale')) {
        return isOneOffSaleDetailsValid.value;
    }
    if (props.monetizationSelection === t('data.designer.subscription')) {
        return isSubscriptionDetailsValid.value;
    }
    if (props.monetizationSelection === t('data.designer.nft')) {
        return isNFTDetailsValid.value;
    }
    if (props.monetizationSelection === t('data.designer.investmentPlan')) {
        return isInvestmentPlanDetailsValid.value;
    }
    return false;
});

watch(isMonetizationValid, () => {
    emit('isMonetizationValid', isMonetizationValid.value);
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
    'update:nft-price',
    'isMonetizationValid',
    'reset-monetization',
    'submit',
    'reset',
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

const switchDatasetOpen = ref<boolean>(false);
</script>

<template>
    <UModal v-model="switchDatasetOpen">
        <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
            <p class="font-bold text-xl">{{ $t('data.designer.areYouSure') }}</p>
            <p class="text-gray-400 mt-6">{{ $t('data.designer.willReset') }}</p>
            <div class="flex gap-8 w-full justify-center mt-6">
                <UButton color="white" class="w-20 flex justify-center" @click="switchDatasetOpen = false">{{
                    $t('cancel')
                }}</UButton>
                <UButton class="w-20 flex justify-center" @click="emit('reset'), (switchDatasetOpen = false)">{{
                    $t('yes')
                }}</UButton>
            </div>
        </UCard>
    </UModal>
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
                <SubHeading
                    :title="$t('data.designer.monetizationMethod')"
                    :info="$t('data.designer.monetizationMethodInfo')"
                />
            </template>

            <SelectionCards
                :model-value="props.monetizationSelection"
                :selections="monetizationSelections"
                @update:model-value="
                    (value: string) => {
                        emit('update:monetization-selection', value);
                        emit('reset-monetization');
                    }
                "
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
                    v-if="props.monetizationSelection === t('data.designer.oneOffSale')"
                    class="flex flex-col gap-4 mt-6 w-full"
                    :state="props.oneOffSaleDetails"
                    :schema="oneOffSaleSchema"
                >
                    <div class="flex flex-col">
                        <div class="flex flex-row gap-2">
                            <UFormGroup :label="$t('data.designer.oneOffPrice')" required name="price" class="w-1/2">
                                <UInput
                                    :model-value="props.oneOffSaleDetails.price"
                                    :placeholder="$t('data.designer.assetPrice')"
                                    type="numeric"
                                    @update:model-value="(value: string) => emit('update:oneoff-price', value)"
                                >
                                    <template #trailing>
                                        <span class="text-gray-500 text-xs">STC</span>
                                    </template>
                                </UInput>
                            </UFormGroup>
                            <UFormGroup :label="$t('license')" required name="license" class="w-1/2">
                                <USelectMenu
                                    :model-value="props.oneOffSaleDetails.license"
                                    :placeholder="$t('data.designer.selectLicense')"
                                    :options="licenseSelections"
                                    @update:model-value="(value: string) => emit('update:oneoff-license', value)"
                                />
                            </UFormGroup>
                        </div>
                        <div class="flex flex-row gap-2 mt-3">
                            <UFormGroup
                                :label="$t('data.designer.downloadLimit')"
                                required
                                name="limitNumber"
                                class="w-1/2"
                            >
                                <UInput
                                    :model-value="props.oneOffSaleDetails.limitNumber"
                                    :placeholder="$t('data.designer.downloadLimitPH')"
                                    type="numeric"
                                    @update:model-value="(value: string) => emit('update:oneoff-limit-number', value)"
                                >
                                    <template #trailing>
                                        <span class="text-gray-500 text-xs">{{ $t('times') }}</span>
                                    </template>
                                </UInput>
                            </UFormGroup>
                            <UFormGroup :label="$t('frequency')" required name="limitFrequency" class="w-1/2">
                                <USelectMenu
                                    :model-value="props.oneOffSaleDetails.limitFrequency"
                                    :placeholder="$t('data.designer.selectFrequency')"
                                    :options="limitFrequencySelections"
                                    @update:model-value="
                                        (value: string) => emit('update:oneoff-limit-frequency', value)
                                    "
                                />
                            </UFormGroup>
                        </div>
                    </div>
                    <UFormGroup :label="$t('termsConditions')" required name="terms">
                        <UTextarea
                            :model-value="props.oneOffSaleDetails.terms"
                            :rows="4"
                            :placeholder="$t('data.designer.typeTerms')"
                            resize
                            icon="i-heroicons-envelope"
                            @update:model-value="(value: string) => emit('update:oneoff-terms', value)"
                        />
                    </UFormGroup>
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
                    v-if="props.monetizationSelection === t('data.designer.subscription')"
                    class="flex flex-col gap-4 mt-6 w-full"
                    :state="props.subscriptionDetails"
                    :schema="subscriptionSchema"
                >
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-row gap-2 justify-center align-middle">
                            <UFormGroup
                                :label="$t('data.designer.subscriptionPrice')"
                                class="w-1/4"
                                required
                                name="price"
                            >
                                <UInput
                                    :model-value="props.subscriptionDetails.price"
                                    :placeholder="$t('data.designer.subscriptionPricePH')"
                                    type="numeric"
                                    @update:model-value="(value: string) => emit('update:sub-price', value)"
                                >
                                    <template #trailing>
                                        <span class="text-gray-500 text-xs">STC</span>
                                    </template>
                                </UInput>
                            </UFormGroup>
                            <UFormGroup
                                :label="$t('data.designer.subscriptionFrequency')"
                                class="w-1/4 pl-6 align-middle"
                                required
                                name="frequency"
                            >
                                <template class="flex flex-row gap-2 mt-2 align-middle">
                                    <URadio
                                        :label="$t('data.designer.monthly')"
                                        :model-value="props.subscriptionDetails.frequency"
                                    />
                                    <URadio
                                        :label="$t('data.designer.annual')"
                                        :model-value="props.subscriptionDetails.frequency"
                                    />
                                </template>
                            </UFormGroup>
                            <UFormGroup :label="$t('license')" required class="w-1/2" name="license">
                                <USelectMenu
                                    :model-value="props.subscriptionDetails.license"
                                    :class="'gray'"
                                    :placeholder="$t('data.designer.selectLicense')"
                                    :options="licenseSelections"
                                    @update:model-value="(value: string) => emit('update:sub-license', value)"
                                />
                            </UFormGroup>
                        </div>
                        <div class="flex flex-row gap-2 mt-3">
                            <UFormGroup
                                :label="$t('data.designer.downloadLimit')"
                                class="w-1/2"
                                required
                                name="limitNumber"
                            >
                                <UInput
                                    :model-value="props.subscriptionDetails.limitNumber"
                                    :placeholder="$t('data.designer.downloadLimitPH')"
                                    type="numeric"
                                    @update:model-value="(value: string) => emit('update:sub-limit-number', value)"
                                >
                                    <template #trailing>
                                        <span class="text-gray-500 text-xs">times</span>
                                    </template>
                                </UInput>
                            </UFormGroup>
                            <UFormGroup :label="$t('frequency')" required name="limitFrequency" class="w-1/2">
                                <USelectMenu
                                    :model-value="props.subscriptionDetails.limitFrequency"
                                    :placeholder="$t('data.designer.selectFrequency')"
                                    :options="limitFrequencySelections"
                                    @update:model-value="(value: string) => emit('update:sub-limit-frequency', value)"
                                />
                            </UFormGroup>
                        </div>
                    </div>
                    <UFormGroup :label="$t('termsConditions')" required name="terms">
                        <UTextarea
                            :model-value="props.subscriptionDetails.terms"
                            resize
                            :rows="4"
                            :placeholder="$t('data.designer.typeTerms')"
                            icon="i-heroicons-envelope"
                            @update:model-value="(value: string) => emit('update:sub-terms', value)"
                        />
                    </UFormGroup>
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
                    v-if="props.monetizationSelection === t('data.designer.nft')"
                    class="flex flex-col gap-4 mt-6 w-full"
                    :state="props.NFTDetails"
                    :schema="NFTschema"
                >
                    <UFormGroup :label="$t('data.designer.nftPrice')" required name="price">
                        <UInput
                            :model-value="props.NFTDetails.price"
                            :placeholder="$t('price')"
                            type="numeric"
                            @update:model-value="(value: string) => emit('update:nft-price', value)"
                        >
                            <template #trailing>
                                <span class="text-gray-500 text-xs">STC</span>
                            </template>
                        </UInput>
                    </UFormGroup>
                    <UButton color="white" class="w-40 flex items-center justify-center">{{
                        $t('data.designer.generateNFT')
                    }}</UButton>
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
                            v-if="props.monetizationSelection === t('data.designer.investmentPlan')"
                            :label="$t('data.designer.searchEditCreatePlan')"
                        >
                            <div class="flex items-center gap-4">
                                <USelectMenu
                                    v-model="selectedInvestmentPlan"
                                    icon="i-heroicons-magnifying-glass-20-solid"
                                    searchable
                                    :searchable-placeholder="$t('data.designer.searchPlan')"
                                    class="w-full relative"
                                    :placeholder="$t('data.designer.searchSelectPlan')"
                                    :options="investmentPlanTitles"
                                    @update:model-value="(value: string) => updateInvestmentPlan(value)"
                                />
                                <span v-if="selectedInvestmentPlan"> {{ $t('or') }}</span>
                                <span
                                    v-if="selectedInvestmentPlan"
                                    class="cursor-pointer text-primary-500 whitespace-nowrap"
                                    @click="editPlan"
                                >
                                    {{ $t('data.designer.editPlan') }}
                                </span>
                                <span> {{ $t('or') }} </span>
                                <span class="cursor-pointer text-primary-500 whitespace-nowrap" @click="createNewPlan">
                                    {{ $t('data.designer.createPlan') }}
                                </span>
                            </div>
                        </UFormGroup>
                        <div v-if="selectedInvestmentPlan && !showCreatePlan" class="flex flex-col gap-4">
                            <p>
                                {{ $t('data.designer.investmentPlanTitle') }}:
                                <span class="font-bold">{{ investmentPlans[selectedInvestmentPlan].title }}</span>
                            </p>
                            <p>
                                {{ $t('data.designer.totalEquityPercentage') }}:
                                <span class="font-bold"
                                    >{{ investmentPlans[selectedInvestmentPlan].totalEqPercentage }}%</span
                                >
                            </p>
                            <p>
                                {{ $t('data.designer.minEquityPercentage') }}:
                                <span class="font-bold"
                                    >{{ investmentPlans[selectedInvestmentPlan].minEqPercentage }}%</span
                                >
                            </p>
                            <p>
                                {{ $t('data.designer.equityPrice') }}:
                                <span class="font-bold">{{ investmentPlans[selectedInvestmentPlan].eqPrice }} STC</span>
                            </p>
                            <p>
                                {{ $t('data.designer.maxInvestors') }}:
                                <span class="font-bold"
                                    >{{ investmentPlans[selectedInvestmentPlan].maxNoInvestors }} investors</span
                                >
                            </p>
                        </div>
                    </div>
                    <UForm
                        v-if="props.monetizationSelection === $t('data.designer.investmentPlan') && showCreatePlan"
                        class="flex flex-col gap-4 mt-6 w-full"
                        :state="props.investmentPlanDetails"
                        :schema="investmentSchema"
                    >
                        <UFormGroup :label="$t('data.designer.investmentPlanTitle')" required name="title">
                            <UInput
                                :model-value="props.investmentPlanDetails.title"
                                :placeholder="$t('data.designer.investmentPlanTitle')"
                                @update:model-value="(value: string[]) => emit('update:plan-title', value)"
                            />
                        </UFormGroup>
                        <UFormGroup
                            :label="$t('data.designer.totalEquityPercentage')"
                            required
                            name="totalEqPercentage"
                        >
                            <UInput
                                :model-value="props.investmentPlanDetails.totalEqPercentage"
                                :placeholder="$t('percentage')"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:plan-total-eq-percentage', value)"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">%</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup :label="$t('data.designer.minEquityPercentage')" required name="minEqPercentage">
                            <UInput
                                :model-value="props.investmentPlanDetails.minEqPercentage"
                                :placeholder="$t('percentage')"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:plan-min-eq-percentage', value)"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">%</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup :label="$t('data.designer.equityPrice')" required name="eqPrice">
                            <UInput
                                :model-value="props.investmentPlanDetails.eqPrice"
                                :placeholder="$t('price')"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:plan-eq-price', value)"
                            >
                                <template #trailing>
                                    <span class="text-gray-500 text-xs">STC</span>
                                </template>
                            </UInput>
                        </UFormGroup>
                        <UFormGroup :label="$t('data.designer.maxInvestors')" required name="maxNoInvestors">
                            <UInput
                                :model-value="props.investmentPlanDetails.maxNoInvestors"
                                :placeholder="$t('data.designer.maxInvestors')"
                                type="numeric"
                                @update:model-value="(value: string) => emit('update:plan-max-no-investors', value)"
                            >
                            </UInput>
                        </UFormGroup>
                        <UButton
                            color="white"
                            class="w-44 flex justify-center items-center"
                            :disabled="!isInvestmentPlanDetailsValid"
                            @click="saveInvestmentPlan"
                            >{{ $t('data.designer.saveInvestmentPlan') }}</UButton
                        >
                    </UForm>
                </div>
            </Transition>
            <div class="flex w-full justify-between">
                <UButton
                    size="md"
                    color="gray"
                    variant="outline"
                    :label="$t('cancel')"
                    :trailing="false"
                    @click="switchDatasetOpen = true"
                />
                <UButton class="px-4 py-2 order-last" :disabled="!isAllValid" @click="emit('submit')"
                    >{{ $t('submit') }}
                </UButton>
            </div>
        </UCard>
    </Transition>
</template>
