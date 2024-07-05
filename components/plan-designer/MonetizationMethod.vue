<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import type CardSelection from '~/interfaces/card-selection';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';
import { MonetMethod } from '~/interfaces/monetization-method.enum';
import { SubscriptionFrequency } from '~/interfaces/subscription-frequency.enum';

import type {
    InvestmentPlanDetails,
    NFTDetails,
    OneOffSaleDetails,
    SubscriptionDetails,
} from '../../interfaces/plan-designer';

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

const props = defineProps({
    completeOrQuery: {
        type: String,
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

let oneOffSaleDetails = reactive<OneOffSaleDetails>({
    priceKind: undefined,
    price: undefined,
    license: undefined,
    terms: undefined,
    limitNumber: undefined,
    limitFrequency: undefined,
});

let subscriptionDetails = reactive<SubscriptionDetails>({
    frequency: undefined,
    priceKind: undefined,
    price: undefined,
    license: undefined,
    terms: undefined,
    limitNumber: undefined,
    limitFrequency: undefined,
});

let investmentPlanDetails = reactive<InvestmentPlanDetails>({
    title: undefined,
    totalEqPercentage: undefined,
    minEqPercentage: undefined,
    eqPrice: undefined,
    maxNoInvestors: undefined,
});

let detailsOfNFT = reactive<NFTDetails>({
    price: undefined,
});

const resetMonetization = () => {
    oneOffSaleDetails = reactive({
        priceKind: undefined,
        price: undefined,
        license: undefined,
        terms: undefined,
        limitNumber: undefined,
        limitFrequency: undefined,
    });
    subscriptionDetails = reactive({
        frequency: undefined,
        priceKind: undefined,
        price: undefined,
        license: undefined,
        terms: undefined,
        limitNumber: undefined,
        limitFrequency: undefined,
    });
    investmentPlanDetails = reactive({
        title: undefined,
        totalEqPercentage: undefined,
        minEqPercentage: undefined,
        eqPrice: undefined,
        maxNoInvestors: undefined,
    });
    detailsOfNFT = reactive({
        price: undefined,
    });
};

const switchWarningOpen = ref(false);
const monetizationToSend = ref();

const monetizationSelections: CardSelection[] = [
    {
        title: t('data.designer.oneOffSale'),
        info: t('data.designer.oneOffSaleInfo'),
        value: MonetMethod.ONE_OFF,
        disabled: false,
    },
    {
        title: t('data.designer.subscription'),
        info: t('data.designer.subscriptionInfo'),
        value: MonetMethod.SUBSCRIPTION,
        disabled: false,
    },
    {
        title: t('data.designer.nft'),
        info: t('data.designer.nftInfo'),
        value: MonetMethod.NFT,
        disabled: true,
    },
    {
        title: t('data.designer.investmentPlan'),
        info: t('data.designer.investmentPlanInfo'),
        value: MonetMethod.INVESTMENT,
        disabled: true,
    },
];

const oneOffIsFree = ref(false);
const subscriptionIsFree = ref(false);

const licenseSelections: string[] = ['CC-BY', 'MIT', 'CC0'];

const limitFrequencySelections = computed(() => [
    { title: t('perHour'), value: DownloadFrequency.HOUR },
    { title: t('perDay'), value: DownloadFrequency.DAY },
    { title: t('perWeek'), value: DownloadFrequency.WEEK },
    { title: t('perMonth'), value: DownloadFrequency.MONTH },
    { title: t('perYear'), value: DownloadFrequency.YEAR },
]);

const oneOffSaleSchema = z
    .object({
        // price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
        price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).refine(
            (val) => {
                return oneOffIsFree.value ? val === 0 : val > 0;
            },
            {
                message: oneOffIsFree.value ? '' : t('data.designer.priceHigherThanZero'),
            },
        ),
        license: z.string(),
        terms: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
        limitNumber: z.coerce
            .number({ invalid_type_error: t('val.validNumber') })
            .gte(0, t('val.zeroOrPositive'))
            .refine(
                (val) => {
                    return val > 0;
                },
                {
                    message: t('val.zeroOrPositive'),
                },
            ),
        limitFrequency: z.string(),
    })
    .required();

const subscriptionSchema = z
    .object({
        frequency: z.string(),
        // price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.zeroOrPositive')),
        price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).refine(
            (val) => {
                return subscriptionIsFree.value ? val === 0 : val > 0;
            },
            {
                message: subscriptionIsFree.value ? '' : t('data.designer.priceHigherThanZero'),
            },
        ),
        license: z.string(),
        terms: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
        limitNumber: z.coerce
            .number({ invalid_type_error: t('val.validNumber') })
            .gte(0, t('val.zeroOrPositive'))
            .refine(
                (val) => {
                    return val > 0;
                },
                {
                    message: t('val.zeroOrPositive'),
                },
            ),
        limitFrequency: z.string(),
    })
    .required();

const investmentSchema = z
    .object({
        title: z.string().min(10, t('val.atLeastNumberChars', { count: 10 })),
        totalEqPercentage: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
        minEqPercentage: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
        eqPrice: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
        maxNoInvestors: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
    })
    .required();

type investment = z.output<typeof investmentSchema>;

const investmentPlans = ref<{ [key: string]: investment }>({
    'Title 1': {
        title: 'Title 1',
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

const NFTschema = z
    .object({
        price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
    })
    .required();

const isOneOffSaleDetailsValid = computed(() => {
    return oneOffSaleSchema.safeParse(oneOffSaleDetails).success;
});
const isSubscriptionDetailsValid = computed(() => {
    return subscriptionSchema.safeParse(subscriptionDetails).success;
});
const isNFTDetailsValid = computed(() => {
    return NFTschema.safeParse(detailsOfNFT).success;
});
const isInvestmentPlanDetailsValid = computed(() => {
    return investmentSchema.safeParse(investmentPlanDetails).success;
});

const isMonetizationValid = computed(() => {
    if (props.monetizationSelection === MonetMethod.ONE_OFF) {
        return isOneOffSaleDetailsValid.value;
    }
    if (props.monetizationSelection === MonetMethod.SUBSCRIPTION) {
        return isSubscriptionDetailsValid.value;
    }
    if (props.monetizationSelection === MonetMethod.NFT) {
        return isNFTDetailsValid.value;
    }
    if (props.monetizationSelection === MonetMethod.INVESTMENT) {
        return isInvestmentPlanDetailsValid.value;
    }
    return false;
});

watch(isMonetizationValid, () => {
    emit('isMonetizationValid', isMonetizationValid.value);
});

const emit = defineEmits([
    'update:one-off-sale-details',
    'update:subscription-details',
    'update:nft-details',
    'update:investment-details',
    'update:monetization-selection',
    'isMonetizationValid',
    'reset-monetization',
    'changePage',
    'reset',
]);

watch(oneOffSaleDetails, () => {
    emit('update:one-off-sale-details', oneOffSaleDetails);
});

watch(subscriptionDetails, () => {
    emit('update:subscription-details', subscriptionDetails);
});

watch(detailsOfNFT, () => {
    emit('update:nft-details', detailsOfNFT);
});

watch(investmentPlanDetails, () => {
    emit('update:investment-details', investmentPlanDetails);
});

const oneOffForm = ref();

const updateOneOffFree = (value: boolean) => {
    oneOffIsFree.value = value;

    if (oneOffIsFree.value) {
        oneOffSaleDetails.price = 0;

        oneOffForm.value.setErrors(
            oneOffForm.value.getErrors().map((err: unknown) =>
                err.path === 'price'
                    ? {
                          message: '',
                          path: 'price',
                      }
                    : {
                          message: err.message,
                          path: err.path,
                      },
            ),
        );
    }
};

const subscriptionForm = ref();

const updateSubscriptionFree = (value: boolean) => {
    subscriptionIsFree.value = value;

    if (subscriptionIsFree.value) {
        subscriptionDetails.price = 0;

        subscriptionForm.value.setErrors(
            subscriptionForm.value.getErrors().map((err: unknown) =>
                err.path === 'price'
                    ? {
                          message: '',
                          path: 'price',
                      }
                    : {
                          message: err.message,
                          path: err.path,
                      },
            ),
        );
    }
};

const updateInvestmentPlan = (_title: string) => {
    showCreatePlan.value = false;
    // const obj = investmentPlans.value[title];

    // emit('update:plan-title', obj.title);
    // emit('update:plan-total-eq-percentage', obj.totalEqPercentage);
    // emit('update:plan-min-eq-percentage', obj.minEqPercentage);
    // emit('update:plan-eq-price', obj.eqPrice);
    // emit('update:plan-max-no-investors', obj.maxNoInvestors);
};

const investmentPlanTitles = computed(() => Object.keys(investmentPlans.value));

const selectedInvestmentPlan = ref<string>('');

const showCreatePlan = ref<boolean>(false);

const createNewPlan = () => {
    showCreatePlan.value = true;
    selectedInvestmentPlan.value = '';
    // emit('update:plan-title', '');
    // emit('update:plan-total-eq-percentage', undefined);
    // emit('update:plan-min-eq-percentage', undefined);
    // emit('update:plan-eq-price', undefined);
    // emit('update:plan-max-no-investors', undefined);
};

const editPlan = () => {
    showCreatePlan.value = true;
};

const saveInvestmentPlan = () => {
    investmentPlans.value[investmentPlanDetails.title] = {
        title: investmentPlanDetails.title,
        totalEqPercentage: investmentPlanDetails.totalEqPercentage,
        minEqPercentage: investmentPlanDetails.minEqPercentage,
        eqPrice: investmentPlanDetails.eqPrice,
        maxNoInvestors: investmentPlanDetails.maxNoInvestors,
    };
    showCreatePlan.value = false;
    selectedInvestmentPlan.value = investmentPlanDetails.title;
};

const handleMonetizationClick = (value: string) => {
    switchWarningOpen.value = true;
    monetizationToSend.value = value;
    resetMonetization();
    emit('reset-monetization');
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
                        (value: string) =>
                            value === MonetMethod.NFT || value === MonetMethod.INVESTMENT
                                ? null
                                : handleMonetizationClick(value)
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
                        v-if="props.monetizationSelection === MonetMethod.ONE_OFF"
                        ref="oneOffForm"
                        class="flex flex-col w-full"
                        :state="oneOffSaleDetails"
                        :schema="oneOffSaleSchema"
                    >
                        <div class="flex flex-col space-y-5">
                            <div class="flex flex-row gap-4">
                                <div class="flex-1 flex gap-4">
                                    <UFormGroup
                                        :label="$t('data.designer.oneOffPrice')"
                                        class="flex-1"
                                        :required="!oneOffIsFree"
                                        name="price"
                                    >
                                        <UInput
                                            v-model="oneOffSaleDetails.price"
                                            :class="oneOffIsFree ? 'opacity-50' : ''"
                                            :disabled="oneOffIsFree"
                                            :placeholder="$t('data.designer.oneOffPrice')"
                                            type="numeric"
                                        >
                                            <template #trailing>
                                                <span class="text-gray-500 text-xs">STC</span>
                                            </template>
                                        </UInput>
                                    </UFormGroup>
                                    <UFormGroup :label="$t('data.designer.free')" name="free">
                                        <UCheckbox
                                            :model-value="oneOffIsFree"
                                            name="oneOffFree"
                                            class="mt-2.5 flex-1 justify-center"
                                            @update:model-value="(value: boolean) => updateOneOffFree(value)"
                                        />
                                    </UFormGroup>
                                </div>
                                <UFormGroup :label="$t('license')" required name="license" class="flex-1 text-gray-200">
                                    <USelectMenu
                                        v-model="oneOffSaleDetails.license"
                                        :ui="{
                                            option: { active: 'text-gray-200' },
                                            input: 'placeholder:text-gray-200 text-gray-200',
                                            button: 'text-gray-200',
                                        }"
                                        :placeholder="$t('data.designer.selectLicense')"
                                        :options="licenseSelections"
                                        ><template #label>
                                            <span v-if="oneOffSaleDetails.license" class="truncate">{{
                                                oneOffSaleDetails.license
                                            }}</span>
                                            <span v-else class="text-gray-400">Select license</span>
                                        </template></USelectMenu
                                    >
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
                                        v-model="oneOffSaleDetails.limitNumber"
                                        :placeholder="$t('data.designer.downloadLimitPH')"
                                        type="numeric"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">{{ $t('times') }}</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup :label="$t('frequency')" required name="limitFrequency" class="flex-1">
                                    <USelectMenu
                                        v-model="oneOffSaleDetails.limitFrequency"
                                        :placeholder="$t('data.designer.selectFrequency')"
                                        :options="limitFrequencySelections"
                                        value-attribute="value"
                                        option-attribute="title"
                                        ><template #label>
                                            <span v-if="oneOffSaleDetails.limitFrequency" class="truncate">{{
                                                oneOffSaleDetails.limitFrequency
                                            }}</span>
                                            <span v-else class="text-gray-400">Select a frequency</span>
                                        </template></USelectMenu
                                    >
                                </UFormGroup>
                            </div>
                            <UFormGroup :label="$t('termsConditions')" required name="terms">
                                <UTextarea
                                    v-model="oneOffSaleDetails.terms"
                                    :rows="4"
                                    :placeholder="$t('data.designer.typeTerms')"
                                    resize
                                    icon="i-heroicons-envelope"
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
                        v-if="props.monetizationSelection === MonetMethod.SUBSCRIPTION"
                        ref="subscriptionForm"
                        class="flex flex-col w-full"
                        :state="subscriptionDetails"
                        :schema="subscriptionSchema"
                    >
                        <div class="flex flex-col space-y-5">
                            <div class="flex flex-row gap-4">
                                <div class="flex gap-4 w-1/2">
                                    <UFormGroup
                                        :label="$t('data.designer.subscriptionFrequency')"
                                        required
                                        name="frequency"
                                    >
                                        <div class="flex items-start justify-start flex-row gap-4 mt-2.5">
                                            <URadio
                                                v-model="subscriptionDetails.frequency"
                                                :label="$t('data.designer.monthly')"
                                                :value="SubscriptionFrequency.MONTHLY"
                                            />
                                            <URadio
                                                v-model="subscriptionDetails.frequency"
                                                :label="$t('data.designer.annual')"
                                                :value="SubscriptionFrequency.ANNUAL"
                                            />
                                        </div>
                                    </UFormGroup>
                                    <div class="flex-1 flex gap-4">
                                        <UFormGroup
                                            :label="$t('data.designer.subscriptionPrice')"
                                            class="flex-1"
                                            :required="!subscriptionIsFree"
                                            name="price"
                                        >
                                            <UInput
                                                v-model="subscriptionDetails.price"
                                                :class="subscriptionIsFree ? 'opacity-50' : ''"
                                                :disabled="subscriptionIsFree"
                                                :placeholder="$t('data.designer.subscriptionPricePH')"
                                                type="numeric"
                                            >
                                                <template #trailing>
                                                    <span class="text-gray-500 text-xs">STC</span>
                                                </template>
                                            </UInput>
                                        </UFormGroup>
                                        <UFormGroup :label="$t('data.designer.free')" name="free">
                                            <UCheckbox
                                                :model-value="subscriptionIsFree"
                                                name="subscriptionFree"
                                                class="mt-2.5 flex-1 justify-center"
                                                @update:model-value="(value: boolean) => updateSubscriptionFree(value)"
                                            />
                                        </UFormGroup>
                                    </div>
                                </div>
                                <UFormGroup :label="$t('license')" required class="w-1/2" name="license">
                                    <USelectMenu
                                        v-model="subscriptionDetails.license"
                                        :class="'gray'"
                                        :placeholder="$t('data.designer.selectLicense')"
                                        :options="licenseSelections"
                                        ><template #label>
                                            <span v-if="subscriptionDetails.license" class="truncate">{{
                                                subscriptionDetails.license
                                            }}</span>
                                            <span v-else class="text-gray-400">Select a license</span>
                                        </template></USelectMenu
                                    >
                                </UFormGroup>
                            </div>
                            <div class="flex flex-row gap-4">
                                <UFormGroup
                                    :label="$t('data.designer.downloadLimit')"
                                    class="flex-1"
                                    required
                                    name="limitNumber"
                                >
                                    <UInput
                                        v-model="subscriptionDetails.limitNumber"
                                        :placeholder="$t('data.designer.downloadLimitPH')"
                                        type="numeric"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">times</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup :label="$t('frequency')" required name="limitFrequency" class="flex-1">
                                    <USelectMenu
                                        v-model="subscriptionDetails.limitFrequency"
                                        :placeholder="$t('data.designer.selectFrequency')"
                                        :options="limitFrequencySelections"
                                        value-attribute="value"
                                        option-attribute="title"
                                        ><template #label>
                                            <span v-if="subscriptionDetails.limitFrequency" class="truncate">{{
                                                subscriptionDetails.limitFrequency
                                            }}</span>
                                            <span v-else class="text-gray-400">Select a frequency</span>
                                        </template></USelectMenu
                                    >
                                </UFormGroup>
                            </div>

                            <UFormGroup :label="$t('termsConditions')" required name="terms">
                                <UTextarea
                                    v-model="subscriptionDetails.terms"
                                    resize
                                    :rows="4"
                                    :placeholder="$t('data.designer.typeTerms')"
                                    icon="i-heroicons-envelope"
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
                        v-if="props.monetizationSelection === MonetMethod.NFT"
                        class="flex flex-col w-full"
                        :state="detailsOfNFT"
                        :schema="NFTschema"
                    >
                        <div class="flex flex-col space-y-5">
                            <UFormGroup :label="$t('data.designer.nftPrice')" required name="price">
                                <UInput v-model="detailsOfNFT.price" :placeholder="$t('price')" type="numeric">
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
                                v-if="props.monetizationSelection === MonetMethod.INVESTMENT"
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
                                    <span class="font-bold"
                                        >{{ investmentPlans[selectedInvestmentPlan].eqPrice }} STC</span
                                    >
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
                            v-if="props.monetizationSelection === MonetMethod.INVESTMENT && showCreatePlan"
                            class="flex flex-col w-full"
                            :state="investmentPlanDetails"
                            :schema="investmentSchema"
                        >
                            <div class="flex flex-col space-y-5">
                                <UFormGroup :label="$t('data.designer.investmentPlanTitle')" required name="title">
                                    <UInput
                                        v-model="investmentPlanDetails.title"
                                        :placeholder="$t('data.designer.investmentPlanTitle')"
                                    />
                                </UFormGroup>
                                <UFormGroup
                                    :label="$t('data.designer.totalEquityPercentage')"
                                    required
                                    name="totalEqPercentage"
                                >
                                    <UInput
                                        v-model="investmentPlanDetails.totalEqPercentage"
                                        :placeholder="$t('percentage')"
                                        type="numeric"
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
                                        v-model="investmentPlanDetails.minEqPercentage"
                                        :placeholder="$t('percentage')"
                                        type="numeric"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">%</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup :label="$t('data.designer.equityPrice')" required name="eqPrice">
                                    <UInput
                                        v-model="investmentPlanDetails.eqPrice"
                                        :placeholder="$t('price')"
                                        type="numeric"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">STC</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup :label="$t('data.designer.maxInvestors')" required name="maxNoInvestors">
                                    <UInput
                                        v-model="investmentPlanDetails.maxNoInvestors"
                                        :placeholder="$t('data.designer.maxInvestors')"
                                        type="numeric"
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
                <div class="flex w-full justify-end">
                    <UButton
                        class="px-4 py-2 order-last"
                        @click="
                            isAllValid ? emit('changePage', 'editor') : showErrorMessage(t('data.designer.pleaseCheck'))
                        "
                        >{{ $t('next') }}
                    </UButton>
                </div>
            </div>
        </UCard>
    </Transition>
    <UModal v-model="switchWarningOpen">
        <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
            <p class="font-bold text-xl">{{ $t('data.designer.areYouSure') }}</p>
            <p class="text-gray-400 mt-6">{{ $t('data.designer.willReset') }}</p>
            <div class="flex gap-8 w-full justify-center mt-6">
                <UButton color="white" class="w-20 flex justify-center" @click="switchWarningOpen = false">{{
                    $t('cancel')
                }}</UButton>
                <UButton
                    class="w-20 flex justify-center"
                    @click="
                        emit('update:monetization-selection', monetizationToSend);
                        emit('reset-monetization');
                        switchWarningOpen = false;
                    "
                    >{{ $t('yes') }}</UButton
                >
            </div>
        </UCard>
    </UModal>
</template>

<style>
.flex-grow-2 {
    flex-grow: 2;
}
</style>
