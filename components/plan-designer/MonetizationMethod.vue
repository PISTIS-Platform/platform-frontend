<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import { licenses } from '~/constants/licenses';
import type CardSelection from '~/interfaces/card-selection';
import { SubscriptionFrequency } from '~/interfaces/subscription-frequency.enum';

//TODO: Get this list of countries from somewhere like an API call

const { t } = useI18n();

const props = defineProps({
    monetizationDetailsProp: {
        type: Object as PropType<Partial<monetizationType>>,
        required: true,
    },
    assetOfferingDetails: {
        type: Object,
    },
});

//use computed getter and setter to avoid prop mutation
const monetizationDetails = computed({
    get() {
        return props.monetizationDetailsProp;
    },
    set(newValue: Partial<monetizationType>) {
        emit('update:monetization-details-prop', newValue);
    },
});

const { isFree, isWorldwide, isPerpetual, hasPersonalData, monetizationSchema } = useMonetizationSchema();

type monetizationType = z.infer<typeof monetizationSchema>;

const resetMonetization = (monetizationType: 'one-off' | 'subscription' | 'investment' | 'nft') => {
    isFree.value = false;
    emit('update:is-free', false);
    isWorldwide.value = false;
    emit('update:is-worldwide', false);
    isPerpetual.value = false;
    emit('update:is-perpetual', false);
    hasPersonalData.value = false;
    emit('update:has-personal-data');

    if (monetizationType === 'one-off') {
        monetizationDetails.value = {
            type: 'one-off',
            price: 10,
            license: licenses.pistis,
            extraTerms: '',
            contractTerms: '',
            limitNumber: 0,
            limitFrequency: '',
            isExclusive: false,
            region: '',
            transferable: '',
            termDate: '',
            additionalRenewalTerms: '',
            nonRenewalDays: 0,
            contractBreachDays: 0,
            personalDataTerms: '',
        };
    } else if (monetizationType === 'subscription') {
        monetizationDetails.value = {
            type: 'subscription',
            subscriptionFrequency: 'monthly',
            price: 10,
            license: licenses.pistis,
            extraTerms: '',
            contractTerms: '',
            limitNumber: 0,
            limitFrequency: '',
            isExclusive: false,
            region: '',
            transferable: '',
            termDate: '',
            additionalRenewalTerms: '',
            nonRenewalDays: 0,
            contractBreachDays: 0,
            personalDataTerms: '',
        };
    } else if (monetizationType === 'investment') {
        //TODO: Do once we know what goes here
    } else if (monetizationType === 'nft') {
        //TODO: Do once we know what goes here
    }
};

const switchWarningOpen = ref(false);
const monetizationToSend = ref();

const monetizationSelections: CardSelection[] = [
    {
        title: t('data.designer.oneOffSale'),
        info: t('data.designer.oneOffSaleInfo'),
        value: 'one-off',
        disabled: false,
    },
    {
        title: t('data.designer.subscription'),
        info: t('data.designer.subscriptionInfo'),
        value: 'subscription',
        disabled: false,
    },
    {
        title: t('data.designer.nft'),
        info: t('data.designer.nftInfo'),
        value: 'nft',
        disabled: true,
    },
    {
        title: t('data.designer.investmentPlan'),
        info: t('data.designer.investmentPlanInfo'),
        value: 'investment',
        disabled: true,
    },
];

const emit = defineEmits([
    'update:monetization-details-prop',
    'update:is-free',
    'update:is-worldwide',
    'update:is-perpetual',
    'update:has-personal-data',
    'changePage',
    'update:isAllValid',
]);

const formRef = ref();

const updateFree = (value: boolean) => {
    isFree.value = value;
    emit('update:is-free', value);

    if (isFree.value) {
        monetizationDetails.value.price = 0;
    } else {
        monetizationDetails.value.price = undefined;
    }
};

const handleMonetizationClick = (value: string) => {
    switchWarningOpen.value = true;
    monetizationToSend.value = value;
};

const customValidate = () => {
    const errors = [];
    //TODO: Somehow get to AssetOfferingDetails component
    const monetizationTotalErrors = monetizationSchema.safeParse(monetizationDetails.value).error?.issues;
    if (monetizationTotalErrors?.length) {
        for (const error of monetizationTotalErrors) {
            if (error.path[0] === undefined) continue;
            if (error.path[0] === 'contractTerms') continue;
            errors.push({ path: error.path[0], message: error.message });
        }
    }
    if (monetizationDetails.value.price && monetizationDetails.value.price < 10) {
        errors.push({ path: 'price', message: t('val.price') });
    }

    return errors;
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
        <UCard>
            <template #header>
                <SubHeading
                    :title="$t('data.designer.monetizationMethod')"
                    :info="$t('data.designer.monetizationMethodInfo')"
                />
            </template>
            <div class="space-y-5">
                <SelectionCards
                    :model-value="monetizationDetails.type || ''"
                    :selections="monetizationSelections"
                    @update:model-value="(value: string) => handleMonetizationClick(value)"
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
                        ref="formRef"
                        :key="monetizationDetails.type"
                        class="flex flex-col w-full"
                        :state="monetizationDetails"
                        :validate="customValidate"
                        :validate-on="['input', 'submit', 'blur', 'change']"
                    >
                        <template v-if="monetizationDetails.type === 'one-off'">
                            <div class="flex flex-col space-y-5">
                                <div class="flex flex-row gap-4">
                                    <div class="flex-1 flex gap-4">
                                        <UFormGroup
                                            :label="$t('data.designer.oneOffPrice')"
                                            class="flex-1"
                                            :required="!isFree"
                                            name="price"
                                        >
                                            <UInput
                                                v-model.number="monetizationDetails.price"
                                                :class="isFree ? 'opacity-50' : ''"
                                                :disabled="isFree"
                                                :placeholder="$t('data.designer.oneOffPrice')"
                                                type="numeric"
                                            >
                                                <template #trailing>
                                                    <span class="text-gray-500 text-xs">EUR</span>
                                                </template>
                                            </UInput>
                                            <template #error="{ error }">
                                                <span
                                                    :class="[
                                                        error
                                                            ? 'text-red-500 dark:text-red-400'
                                                            : 'text-primary-500 dark:text-primary-400',
                                                    ]"
                                                >
                                                    {{ isFree ? '' : error }}
                                                </span>
                                            </template>
                                        </UFormGroup>
                                        <UFormGroup :label="$t('data.designer.free')" name="free">
                                            <UCheckbox
                                                :model-value="isFree"
                                                name="oneOffFree"
                                                class="mt-2.5 flex-1 justify-center"
                                                @update:model-value="(value: boolean) => updateFree(value)"
                                            />
                                        </UFormGroup>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-if="monetizationDetails.type === 'subscription'">
                            <div class="flex flex-col space-y-5">
                                <div class="flex flex-row gap-4">
                                    <div class="flex gap-4 w-full">
                                        <UFormGroup
                                            :label="$t('data.designer.subscriptionFrequency')"
                                            required
                                            name="subscriptionFrequency"
                                        >
                                            <div class="flex items-start justify-start flex-row gap-4 mt-2.5">
                                                <URadio
                                                    v-model="monetizationDetails.subscriptionFrequency"
                                                    :label="$t('data.designer.monthly')"
                                                    :value="SubscriptionFrequency.MONTHLY"
                                                    selected
                                                />
                                                <URadio
                                                    v-model="monetizationDetails.subscriptionFrequency"
                                                    :label="$t('data.designer.annual')"
                                                    :value="SubscriptionFrequency.ANNUAL"
                                                />
                                            </div>
                                            <template #error="{ error }">
                                                <span
                                                    :class="[
                                                        error
                                                            ? 'text-red-500 dark:text-red-400'
                                                            : 'text-primary-500 dark:text-primary-400',
                                                    ]"
                                                >
                                                    {{ monetizationDetails.subscriptionFrequency ? '' : error }}
                                                </span>
                                            </template>
                                        </UFormGroup>
                                        <div class="flex-1 flex gap-4">
                                            <UFormGroup
                                                :label="$t('data.designer.subscriptionPrice')"
                                                class="flex-1"
                                                :required="!isFree"
                                                name="price"
                                            >
                                                <UInput
                                                    v-model.number="monetizationDetails.price"
                                                    :class="isFree ? 'opacity-50' : ''"
                                                    :disabled="isFree"
                                                    :placeholder="$t('data.designer.subscriptionPricePH')"
                                                    type="numeric"
                                                >
                                                    <template #trailing>
                                                        <span class="text-gray-500 text-xs">EUR</span>
                                                    </template>
                                                </UInput>
                                                <template #error="{ error }">
                                                    <span
                                                        :class="[
                                                            error
                                                                ? 'text-red-500 dark:text-red-400'
                                                                : 'text-primary-500 dark:text-primary-400',
                                                        ]"
                                                    >
                                                        {{ isFree ? '' : error }}
                                                    </span>
                                                </template>
                                            </UFormGroup>
                                            <UFormGroup :label="$t('data.designer.free')" name="free">
                                                <UCheckbox
                                                    :model-value="isFree"
                                                    name="subscriptionFree"
                                                    class="mt-2.5 flex-1 justify-center"
                                                    @update:model-value="(value: boolean) => updateFree(value)"
                                                />
                                            </UFormGroup>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- <template v-if="monetizationDetails.type === 'investment'">
                        </template>

                        <template v-if="monetizationDetails.type === 'nft'">
                        </template> -->
                    </UForm>
                </Transition>
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
                        resetMonetization(monetizationToSend);
                        switchWarningOpen = false;
                    "
                    >{{ $t('yes') }}</UButton
                >
            </div>
        </UCard>
    </UModal>
</template>
