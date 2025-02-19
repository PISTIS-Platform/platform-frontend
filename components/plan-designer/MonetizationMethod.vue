<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import type CardSelection from '~/interfaces/card-selection';
import { SubscriptionFrequency } from '~/interfaces/subscription-frequency.enum';

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();
import dayjs from 'dayjs';

const props = defineProps({
    monetizationDetailsProp: {
        type: Object as PropType<Partial<monetizationType>>,
        required: true,
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

const isMonetizationValid = computed(() => {
    return monetizationSchema.safeParse(monetizationDetails.value).success;
});

const { isFree, monetizationSchema } = useMonetizationSchema();

type monetizationType = z.infer<typeof monetizationSchema>;

const resetMonetization = (monetizationType: 'one-off' | 'subscription' | 'investment' | 'nft') => {
    isFree.value = false;
    emit('update:is-free', false);

    if (monetizationType === 'one-off') {
        monetizationDetails.value = {
            type: 'one-off',
            price: '',
        };
    } else if (monetizationType === 'subscription') {
        monetizationDetails.value = {
            type: 'subscription',
            subscriptionFrequency: 'monthly',
            price: '',
        };
    } else if (monetizationType === 'investment') {
        monetizationDetails.value = {
            type: 'investment',
            percentageToSell: '',
            percentageMinimum: '',
            percentagePrice: '',
            validOfferDate: '',
        };
    } else if (monetizationType === 'nft') {
        //TODO: Do once we know what goes here
    }
};

const monetizationToSend = ref();

const monetizationSelections: CardSelection[] = [
    {
        title: t('data.designer.oneOffSale'),
        // info: t('data.designer.oneOffSaleInfo'),
        value: 'one-off',
        disabled: false,
    },
    {
        title: t('data.designer.subscription'),
        // info: t('data.designer.subscriptionInfo'),
        value: 'subscription',
        disabled: false,
    },
    {
        title: t('data.designer.nft'),
        // info: t('data.designer.nftInfo'),
        value: 'nft',
        disabled: true,
    },
    {
        title: t('data.designer.investmentPlan'),
        // info: t('data.designer.investmentPlanInfo'),
        value: 'investment',
        disabled: false,
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
    monetizationDetails.value.price = '';
};

const handleMonetizationClick = (value: string) => {
    monetizationToSend.value = value;
    resetMonetization(monetizationToSend.value);
};

async function onSubmit(): Promise<void> {
    if (isMonetizationValid.value) {
        emit('changePage', 2);
    } else {
        showErrorMessage(t('data.designer.pleaseCheck'));
    }
}

const customValidate = () => {
    const monetizationErrors = [];
    const monetizationTotalErrors = monetizationSchema.safeParse(monetizationDetails.value).error?.issues;
    if (monetizationTotalErrors?.length) {
        for (const error of monetizationTotalErrors) {
            monetizationErrors.push({ path: error.path[0], message: error.message });
        }
    }
    return monetizationErrors;
};
</script>

<template>
    <UForm
        ref="formRef"
        :key="monetizationDetails.type"
        class="flex flex-col w-full"
        :state="monetizationDetails"
        :validate="customValidate"
    >
        <UCard class="pb-2">
            <template #header>
                <div class="flex items-center gap-8">
                    <UIcon name="material-symbols:monetization-on" class="w-10 h-10 text-gray-500" />
                    <SubHeading
                        :title="$t('data.designer.monetizationMethod')"
                        :info="$t('data.designer.monetizationMethodInfo')"
                    />
                </div>
            </template>
            <div class="space-y-5">
                <SelectionCards
                    :model-value="monetizationDetails.type || ''"
                    :selections="monetizationSelections"
                    @update:model-value="(value: string) => handleMonetizationClick(value)"
                />

                <template v-if="monetizationDetails.type === 'one-off'">
                    <div class="flex flex-col space-y-5">
                        <div class="flex flex-row gap-4">
                            <div class="flex-1 flex gap-4">
                                <UFormGroup
                                    :label="$t('data.designer.oneOffPrice')"
                                    class="flex-1"
                                    :required="!isFree"
                                    name="price"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    eager-validation
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
                                <UFormGroup
                                    :label="$t('data.designer.free')"
                                    name="free"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    eager-validation
                                >
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
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    eager-validation
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
                                        :ui="{ error: 'absolute -bottom-6' }"
                                        eager-validation
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
                                    <UFormGroup
                                        :label="$t('data.designer.free')"
                                        name="free"
                                        :ui="{ error: 'absolute -bottom-6' }"
                                        eager-validation
                                    >
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

                <template v-if="monetizationDetails.type === 'investment'">
                    <div class="flex flex-col space-y-5">
                        <div class="flex flex-row gap-4">
                            <div class="flex flex-col gap-6 w-full">
                                <div class="flex-1 flex gap-4">
                                    <UFormGroup
                                        :label="$t('data.designer.percentageToSell')"
                                        class="flex-1"
                                        name="percentageToSell"
                                        :ui="{ error: 'absolute -bottom-6' }"
                                        required
                                        eager-validation
                                    >
                                        <UInput
                                            v-model.number="monetizationDetails.percentageToSell"
                                            :placeholder="$t('data.designer.ownershipPercentage')"
                                            type="numeric"
                                        >
                                            <template #trailing>
                                                <span class="text-gray-500 text-xs">%</span>
                                            </template>
                                        </UInput>
                                    </UFormGroup>
                                    <UFormGroup
                                        :label="$t('data.designer.priceOfPercentage')"
                                        class="flex-1"
                                        name="percentagePrice"
                                        :ui="{ error: 'absolute -bottom-6' }"
                                        required
                                        eager-validation
                                    >
                                        <UInput
                                            v-model.number="monetizationDetails.percentagePrice"
                                            :placeholder="$t('data.designer.priceOfPercentageInfo')"
                                            type="numeric"
                                        >
                                            <template #trailing>
                                                <span class="text-gray-500 text-xs">EUR</span>
                                            </template>
                                        </UInput>
                                    </UFormGroup>
                                </div>
                                <div class="flex-1 flex gap-4">
                                    <UFormGroup
                                        :label="$t('data.designer.percentageMinimum')"
                                        class="flex-1"
                                        required
                                        name="percentageMinimum"
                                        :ui="{ error: 'absolute -bottom-6' }"
                                        eager-validation
                                    >
                                        <UInput
                                            v-model.number="monetizationDetails.percentageMinimum"
                                            :placeholder="$t('data.designer.percentageMinimumInfo')"
                                            type="numeric"
                                        >
                                            <template #trailing>
                                                <span class="text-gray-500 text-xs">%</span>
                                            </template>
                                        </UInput>
                                    </UFormGroup>
                                    <UFormGroup
                                        :label="$t('data.designer.validOfferDate')"
                                        name="validOfferDate"
                                        class="text-gray-200 flex-1"
                                        :ui="{ error: 'absolute -bottom-6' }"
                                        eager-validation
                                        required
                                    >
                                        <UPopover :popper="{ placement: 'bottom-start' }">
                                            <UButton
                                                color="white"
                                                icon="i-heroicons-calendar-days-20-solid"
                                                :label="
                                                    monetizationDetails.validOfferDate
                                                        ? dayjs(monetizationDetails.validOfferDate).format(
                                                              'DD MMMM YYYY',
                                                          )
                                                        : $t('data.designer.validOfferDateInfo')
                                                "
                                                :class="[
                                                    'w-full',
                                                    monetizationDetails.validOfferDate
                                                        ? 'text-gray-700'
                                                        : 'text-gray-400 font-normal',
                                                ]"
                                            />
                                            <template #panel="{ close }">
                                                <DatePicker
                                                    v-model="monetizationDetails.validOfferDate"
                                                    is-required
                                                    @close="close"
                                                />
                                            </template>
                                        </UPopover>
                                    </UFormGroup>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- <template v-if="monetizationDetails.type === 'nft'">
                        </template> -->
            </div>
        </UCard>
        <div class="w-full flex items-center justify-between mt-4">
            <UButton size="md" color="gray" variant="outline" @click="emit('changePage', 0)">
                {{ $t('back') }}
            </UButton>
            <UButton size="md" type="submit" @click="onSubmit">{{ $t('next') }} </UButton>
        </div>
    </UForm>
</template>
