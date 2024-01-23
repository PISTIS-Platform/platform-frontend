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
    detailsOfNFT: {
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

const monetizationSelections: { title: string; info: string; value: string }[] = [
    {
        title: t('data.designer.oneOffSale'),
        info: t('data.designer.oneOffSaleInfo'),
        value: 'oneOff',
    },
    {
        title: t('data.designer.subscription'),
        info: t('data.designer.subscriptionInfo'),
        value: 'subscription',
    },
    {
        title: t('data.designer.nft'),
        info: t('data.designer.nftInfo'),
        value: 'nft',
    },
    {
        title: t('data.designer.investmentPlan'),
        info: t('data.designer.investmentPlanInfo'),
        value: 'investment',
    },
];

const limitFrequencySelections = computed(() => [t('perDay'), t('perWeek'), t('perMonth'), t('perYear')]);

const oneOffSaleSchema = z.object({
    limit: z.object({
        times: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
        frequency: z.string(),
        until: z.coerce.date({ required_error: 'Please select a date', invalid_type_error: "That's not a date!" }),
    }),
    price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
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
    totalPercentage: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
    minPercentage: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
    price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
    maxInvestors: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
});

type investment = z.output<typeof investmentSchema>;

const investmentPlans = ref<{ [key: string]: investment }>({
    'Title 1': {
        title: 'Title 1',
        totalPercentage: 20,
        minPercentage: 10,
        price: 500,
        maxInvestors: 20,
    },
    'Title 2': {
        title: 'Title 2',
        totalPercentage: 30,
        minPercentage: 5,
        price: 350,
        maxInvestors: 5,
    },
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
    return NFTschema.safeParse(props.detailsOfNFT).success;
});
const isInvestmentPlanDetailsValid = computed(() => {
    return investmentSchema.safeParse(props.investmentPlanDetails).success;
});

const isMonetizationValid = computed(() => {
    console.log(props.monetizationSelection);
    if (props.monetizationSelection === 'oneOff') {
        return isOneOffSaleDetailsValid.value;
    }
    if (props.monetizationSelection === 'subscription') {
        return isSubscriptionDetailsValid.value;
    }
    if (props.monetizationSelection === 'nft') {
        return isNFTDetailsValid.value;
    }
    if (props.monetizationSelection === 'investment') {
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
    'update:oneoff-date',
    'update:oneoff-limit-number',
    'update:oneoff-limit-frequency',
    'update:sub-frequency',
    'update:sub-price',
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
    emit('update:plan-total-eq-percentage', obj.totalPercentage);
    emit('update:plan-min-eq-percentage', obj.minPercentage);
    emit('update:plan-eq-price', obj.price);
    emit('update:plan-max-no-investors', obj.maxInvestors);
};

const investmentPlanTitles = computed(() => Object.keys(investmentPlans.value));

const selectedInvestmentPlan = ref<string>('');

const showCreatePlan = ref<boolean>(false);

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
        totalPercentage: props.investmentPlanDetails.totalPercentage,
        minPercentage: props.investmentPlanDetails.minPercentage,
        price: props.investmentPlanDetails.price,
        maxInvestors: props.investmentPlanDetails.maxInvestors,
    };
    showCreatePlan.value = false;
    selectedInvestmentPlan.value = props.investmentPlanDetails.title;
};

const switchDatasetOpen = ref<boolean>(false);
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
        <UCard v-if="completeOrQuery">
            <template #header>
                <SubHeading
                    :title="$t('data.designer.monetizationMethod')"
                    :info="$t('data.designer.monetizationMethodInfo')"
                />
            </template>
            <div class="space-y-5">
                <SelectionCards
                    :model-value="monetizationSelection"
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
                        v-if="monetizationSelection === 'oneOff'"
                        class="flex flex-col w-full"
                        :state="oneOffSaleDetails"
                        :schema="oneOffSaleSchema"
                    >
                        <div class="flex flex-col space-y-5">
                            <div class="flex flex-row gap-4">
                                <UFormGroup
                                    :label="$t('data.designer.oneOffPrice')"
                                    required
                                    name="price"
                                    class="flex-1"
                                >
                                    <UInput
                                        :model-value="oneOffSaleDetails.price"
                                        :placeholder="$t('data.designer.assetPrice')"
                                        type="numeric"
                                        @update:model-value="(value: string) => emit('update:oneoff-price', value)"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">STC</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup
                                    :label="$t('data.designer.expirationDate')"
                                    required
                                    class="flex-1"
                                    name="expirationDate"
                                >
                                    <UInput
                                        :model-value="oneOffSaleDetails.limit.until"
                                        type="date"
                                        @update:model-value="(value: string) => emit('update:oneoff-date', value)"
                                    />
                                </UFormGroup>
                            </div>
                            <div class="flex flex-row gap-4">
                                <UFormGroup
                                    :label="$t('data.designer.downloadLimit')"
                                    required
                                    name="limitNumber"
                                    class="flex-1"
                                >
                                    <UInput
                                        :model-value="props.oneOffSaleDetails.limit.times"
                                        :placeholder="$t('data.designer.downloadLimitPH')"
                                        type="numeric"
                                        @update:model-value="
                                            (value: string) => emit('update:oneoff-limit-number', value)
                                        "
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">{{ $t('times') }}</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup :label="$t('frequency')" required name="limitFrequency" class="flex-1">
                                    <USelectMenu
                                        :model-value="oneOffSaleDetails.limit.frequency"
                                        :placeholder="$t('data.designer.selectFrequency')"
                                        :options="limitFrequencySelections"
                                        @update:model-value="
                                            (value: string) => emit('update:oneoff-limit-frequency', value)
                                        "
                                        ><template #label>
                                            <span v-if="oneOffSaleDetails.limit.frequency" class="truncate">{{
                                                oneOffSaleDetails.limit.frequency
                                            }}</span>
                                            <span v-else class="text-gray-400">Select a frequency</span>
                                        </template></USelectMenu
                                    >
                                </UFormGroup>
                            </div>
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
                        v-if="monetizationSelection === 'subscription'"
                        class="flex flex-col w-full"
                        :state="subscriptionDetails"
                        :schema="subscriptionSchema"
                    >
                        <div class="flex flex-col space-y-5">
                            <div class="flex flex-row gap-4">
                                <UFormGroup
                                    :label="$t('data.designer.subscriptionPrice')"
                                    class="flex-1"
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
                                    class="flex-1"
                                    required
                                    name="frequency"
                                >
                                    <div class="flex items-start justify-start flex-row">
                                        <URadio
                                            :label="$t('data.designer.monthly')"
                                            :model-value="props.subscriptionDetails.frequency"
                                        />
                                        <URadio
                                            :label="$t('data.designer.annual')"
                                            :model-value="props.subscriptionDetails.frequency"
                                        />
                                    </div>
                                </UFormGroup>
                                <!-- <UFormGroup :label="$t('license')" required class="flex-grow-2 flex-1" name="license">
                                </UFormGroup> -->
                            </div>
                            <div class="flex flex-row gap-4">
                                <UFormGroup
                                    :label="$t('data.designer.downloadLimit')"
                                    class="flex-1"
                                    required
                                    name="limitNumber"
                                >
                                    <UInput
                                        :model-value="props.subscriptionDetails.limit.times"
                                        :placeholder="$t('data.designer.downloadLimitPH')"
                                        type="numeric"
                                        @update:model-value="(value: string) => emit('update:sub-limit-number', value)"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">times</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup :label="$t('frequency')" required name="limitFrequency" class="flex-1">
                                    <USelectMenu
                                        :model-value="subscriptionDetails.limit.frequency"
                                        :placeholder="$t('data.designer.selectFrequency')"
                                        :options="limitFrequencySelections"
                                        @update:model-value="
                                            (value: string) => emit('update:sub-limit-frequency', value)
                                        "
                                        ><template #label>
                                            <span v-if="subscriptionDetails.limit.frequency" class="truncate">{{
                                                subscriptionDetails.limitFrequency
                                            }}</span>
                                            <span v-else class="text-gray-400">Select a frequency</span>
                                        </template></USelectMenu
                                    >
                                </UFormGroup>
                            </div>

                            <!-- <UFormGroup :label="$t('termsConditions')" required name="terms">
                                <UTextarea :model-value="subscriptionDetails.terms" resize :rows="4"
                                    :placeholder="$t('data.designer.typeTerms')" icon="i-heroicons-envelope"
                                    @update:model-value="(value: string) => emit('update:sub-terms', value)" />
                            </UFormGroup> -->
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
                        v-if="monetizationSelection === 'nft'"
                        class="flex flex-col w-full"
                        :state="detailsOfNFT"
                        :schema="NFTschema"
                    >
                        <div class="flex flex-col space-y-5">
                            <UFormGroup :label="$t('data.designer.nftPrice')" required name="price">
                                <UInput
                                    :model-value="detailsOfNFT.price"
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
                    <div class="flex flex-col space-y-5">
                        <div class="flex flex-col gap-4">
                            <UFormGroup
                                v-if="props.monetizationSelection === 'investmentPlan'"
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
                                        ><template #label>
                                            <span v-if="selectedInvestmentPlan" class="truncate">{{
                                                selectedInvestmentPlan
                                            }}</span>
                                            <span v-else class="text-gray-400">{{
                                                $t('data.designer.searchSelectPlan')
                                            }}</span>
                                        </template></USelectMenu
                                    >
                                    <span v-if="selectedInvestmentPlan"> {{ $t('or') }}</span>
                                    <span
                                        v-if="selectedInvestmentPlan"
                                        class="cursor-pointer text-primary-500 whitespace-nowrap"
                                        @click="editPlan"
                                    >
                                        {{ $t('data.designer.editPlan') }}
                                    </span>
                                    <span> {{ $t('or') }} </span>
                                    <span
                                        class="cursor-pointer text-primary-500 whitespace-nowrap"
                                        @click="createNewPlan"
                                    >
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
                                        >{{ investmentPlans[selectedInvestmentPlan].totalPercentage }}%</span
                                    >
                                </p>
                                <p>
                                    {{ $t('data.designer.minEquityPercentage') }}:
                                    <span class="font-bold"
                                        >{{ investmentPlans[selectedInvestmentPlan].minPercentage }}%</span
                                    >
                                </p>
                                <p>
                                    {{ $t('data.designer.equityPrice') }}:
                                    <span class="font-bold"
                                        >{{ investmentPlans[selectedInvestmentPlan].price }} STC</span
                                    >
                                </p>
                                <p>
                                    {{ $t('data.designer.maxInvestors') }}:
                                    <span class="font-bold"
                                        >{{ investmentPlans[selectedInvestmentPlan].maxInvestors }} investors</span
                                    >
                                </p>
                            </div>
                        </div>
                        <UForm
                            v-if="props.monetizationSelection === $t('data.designer.investmentPlan') && showCreatePlan"
                            class="flex flex-col w-full"
                            :state="props.investmentPlanDetails"
                            :schema="investmentSchema"
                        >
                            <div class="flex flex-col space-y-5">
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
                                        :model-value="props.investmentPlanDetails.totalPercentage"
                                        :placeholder="$t('percentage')"
                                        type="numeric"
                                        @update:model-value="
                                            (value: string) => emit('update:plan-total-eq-percentage', value)
                                        "
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">%</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup
                                    :label="$t('data.designer.minEquityPercentage')"
                                    required
                                    name="minEqPercentage"
                                >
                                    <UInput
                                        :model-value="props.investmentPlanDetails.minPercentage"
                                        :placeholder="$t('percentage')"
                                        type="numeric"
                                        @update:model-value="
                                            (value: string) => emit('update:plan-min-eq-percentage', value)
                                        "
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">%</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup :label="$t('data.designer.equityPrice')" required name="eqPrice">
                                    <UInput
                                        :model-value="props.investmentPlanDetails.price"
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
                                        :model-value="props.investmentPlanDetails.maxInvestors"
                                        :placeholder="$t('data.designer.maxInvestors')"
                                        type="numeric"
                                        @update:model-value="
                                            (value: string) => emit('update:plan-max-no-investors', value)
                                        "
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
                            </div>
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
            </div>
        </UCard>
    </Transition>
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
</template>

<style>
.flex-grow-2 {
    flex-grow: 2;
}
</style>
