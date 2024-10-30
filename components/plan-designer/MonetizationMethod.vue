<script setup lang="ts">
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import { licenses } from '~/constants/licenses';
import type CardSelection from '~/interfaces/card-selection';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';
import { SubscriptionFrequency } from '~/interfaces/subscription-frequency.enum';

const { showErrorMessage } = useAlertMessage();
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

const assetOfferingDetailsSchema = z.object({
    title: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    description: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    selectedDistribution: z.object({
        id: z.string(),
        format: z.object({
            id: z.string(),
            label: z.string(),
            resource: z.string(),
        }),
        access_url: z.array(z.string()),
        title: z.object({
            en: z.string(),
        }),
    }),
});

const isAssetOfferingDetailsValid = computed(() => {
    // console.log({ assetOfferingDetailsSchema: assetOfferingDetailsSchema.safeParse(assetOfferingDetails.value) });
    return (
        assetOfferingDetailsSchema.safeParse(props.assetOfferingDetails).success &&
        props.assetOfferingDetails?.keywords.length > 0
    );
});

const isMonetizationValid = computed(() => {
    // console.log({ monetizationSchema: monetizationSchema.safeParse(monetizationDetails.value) });
    return monetizationSchema.safeParse(monetizationDetails.value).success;
});

const isAllValid = computed(() => isAssetOfferingDetailsValid.value && isMonetizationValid.value);

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
            price: 0,
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
            price: 0,
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

const licenseSelections = computed(() => (isFree.value ? Object.values(licenses) : [licenses.pistis]));

const transferableSelections = [
    {
        label: t('data.designer.transferable'),
        value: 'transferable',
    },
    {
        label: t('data.designer.nonTransferable'),
        value: 'non-transferable',
    },
    {
        label: t('data.designer.subLicensable'),
        value: 'sub-licensable',
    },
];

const limitFrequencySelections = computed(() => [
    { title: t('perHour'), value: DownloadFrequency.HOUR as string },
    { title: t('perDay'), value: DownloadFrequency.DAY as string },
    { title: t('perWeek'), value: DownloadFrequency.WEEK as string },
    { title: t('perMonth'), value: DownloadFrequency.MONTH as string },
    { title: t('perYear'), value: DownloadFrequency.YEAR as string },
]);

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

const updateWorldwide = (value: boolean) => {
    isWorldwide.value = value;
    emit('update:is-worldwide', value);
    if (isWorldwide.value) {
        monetizationDetails.value.region = '';
    }
};

const updatePerpetual = (value: boolean) => {
    isPerpetual.value = value;
    emit('update:is-perpetual', value);
    if (isPerpetual.value) {
        monetizationDetails.value.termDate = undefined;
    }
};

const updatePersonal = (value: boolean) => {
    hasPersonalData.value = value;
    emit('update:has-personal-data', value);
    if (!hasPersonalData.value) {
        monetizationDetails.value.personalDataTerms = '';
    }
};

const updateContractTerms = (value: string) => {
    monetizationDetails.value.contractTerms = value;
};

const handleMonetizationClick = (value: string) => {
    switchWarningOpen.value = true;
    monetizationToSend.value = value;
};

const customValidate = () => {
    const errors = [];
    emit('update:isAllValid', isAllValid.value);
    //TODO: Somehow get to AssetOfferingDetails component
    const monetizationTotalErrors = monetizationSchema.safeParse(monetizationDetails.value).error?.issues;
    if (monetizationTotalErrors?.length) {
        for (const error of monetizationTotalErrors) {
            if (error.path[0] === 'contractTerms') continue;
            errors.push({ path: error.path[0], message: error.message });
        }
    }
    if (monetizationDetails.value.price && monetizationDetails.value.price < 10) {
        errors.push({ path: 'price', message: t('val.price') });
    }
    if (!isWorldwide.value && !monetizationDetails.value.region)
        errors.push({ path: 'region', message: t('val.required') });
    else formRef.value.clear('region');
    if (!isPerpetual.value && !monetizationDetails.value.termDate)
        errors.push({ path: 'termDate', message: t('val.required') });
    if (!monetizationDetails.value.transferable) errors.push({ path: 'transferable', message: t('val.required') });
    if (!monetizationDetails.value.nonRenewalDays) errors.push({ path: 'nonRenewalDays', message: t('val.positive') });
    if (!monetizationDetails.value.contractBreachDays)
        errors.push({ path: 'contractBreachDays', message: t('val.positive') });
    if (hasPersonalData.value && !monetizationDetails.value.personalDataTerms)
        errors.push({ path: 'personalDataTerms', message: t('val.required') });

    return errors;
};

async function onSubmit(): Promise<void> {
    if (isAllValid.value) {
        emit('changePage', 2);
    } else {
        if (!props.assetOfferingDetails?.keywords?.length) {
            showErrorMessage(t('data.designer.pleaseEnterAtLeastOneKeyword'));
        }
        showErrorMessage(t('data.designer.pleaseCheck'));
    }
}
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
                        @submit="onSubmit"
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
                                    <UFormGroup
                                        :label="$t('license')"
                                        required
                                        name="license"
                                        class="flex-1 text-gray-200"
                                    >
                                        <USelectMenu
                                            v-model="monetizationDetails.license"
                                            :ui="{
                                                option: { active: 'text-gray-200' },
                                                input: 'placeholder:text-gray-200 text-gray-200',
                                                button: 'text-gray-200',
                                            }"
                                            :placeholder="$t('data.designer.selectLicense')"
                                            :options="licenseSelections"
                                            ><template #label>
                                                <span v-if="monetizationDetails.license" class="truncate">{{
                                                    monetizationDetails.license
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
                                            v-model.number="monetizationDetails.limitNumber"
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
                                            v-model="monetizationDetails.limitFrequency"
                                            :placeholder="$t('data.designer.selectFrequency')"
                                            :options="limitFrequencySelections"
                                            value-attribute="value"
                                            option-attribute="title"
                                            ><template #label>
                                                <span v-if="monetizationDetails.limitFrequency" class="truncate">{{
                                                    monetizationDetails.limitFrequency
                                                }}</span>
                                                <span v-else class="text-gray-400">Select a frequency</span>
                                            </template></USelectMenu
                                        >
                                    </UFormGroup>
                                </div>
                                <div v-if="monetizationDetails.license === licenses.pistis" class="flex flex-col gap-4">
                                    <div class="flex flex-row gap-4">
                                        <div class="flex flex-1 gap-4">
                                            <UFormGroup :label="$t('exclusive')" name="isExclusive">
                                                <UCheckbox
                                                    v-model="monetizationDetails.isExclusive"
                                                    name="isExclusive"
                                                    class="mt-2.5 -ml-1 justify-center"
                                                />
                                            </UFormGroup>
                                            <UFormGroup
                                                :label="$t('data.designer.availability')"
                                                name="region"
                                                :required="!isWorldwide"
                                                class="w-full"
                                            >
                                                <UInput
                                                    v-model.number="monetizationDetails.region"
                                                    :class="isWorldwide ? 'opacity-50' : ''"
                                                    :disabled="isWorldwide"
                                                    :placeholder="$t('data.designer.regionCountry')"
                                                    type="numeric"
                                                    class="w-full"
                                                >
                                                </UInput>
                                                <template #error="{ error }">
                                                    <span
                                                        :class="[
                                                            error
                                                                ? 'text-red-500 dark:text-red-400'
                                                                : 'text-primary-500 dark:text-primary-400',
                                                        ]"
                                                    >
                                                        {{ isWorldwide ? '' : error }}
                                                    </span>
                                                </template>
                                            </UFormGroup>
                                            <UFormGroup :label="$t('data.designer.worldwide')">
                                                <UCheckbox
                                                    :model-value="isWorldwide"
                                                    class="mt-2.5 justify-center"
                                                    @update:model-value="(value: boolean) => updateWorldwide(value)"
                                                />
                                            </UFormGroup>
                                        </div>
                                        <div class="flex flex-1 gap-4">
                                            <UFormGroup
                                                :label="$t('data.designer.transferable')"
                                                required
                                                name="transferable"
                                                class="flex-1 text-gray-200"
                                            >
                                                <USelectMenu
                                                    v-model="monetizationDetails.transferable"
                                                    :ui="{
                                                        option: { active: 'text-gray-200' },
                                                        input: 'placeholder:text-gray-200 text-gray-200',
                                                        button: 'text-gray-200',
                                                    }"
                                                    :placeholder="$t('data.designer.transferable')"
                                                    :options="transferableSelections"
                                                    value-attribute="value"
                                                    option-attribute="label"
                                                ></USelectMenu>
                                            </UFormGroup>
                                            <UFormGroup
                                                :label="$t('data.designer.termDate')"
                                                :required="!isPerpetual"
                                                name="termDate"
                                                class="text-gray-200"
                                            >
                                                <UPopover :popper="{ placement: 'bottom-start' }">
                                                    <UButton
                                                        color="white"
                                                        icon="i-heroicons-calendar-days-20-solid"
                                                        :label="
                                                            monetizationDetails.termDate
                                                                ? dayjs(monetizationDetails.termDate).format(
                                                                      'DD MMMM YYYY',
                                                                  )
                                                                : isPerpetual
                                                                  ? t('data.designer.licenseIsPerpetual')
                                                                  : t('data.designer.pleaseSelectDate')
                                                        "
                                                        :disabled="isPerpetual"
                                                        :class="[
                                                            isPerpetual ? 'opacity-50' : '',
                                                            monetizationDetails.termDate
                                                                ? 'text-gray-700'
                                                                : 'text-gray-400',
                                                        ]"
                                                    />
                                                    <template #panel="{ close }">
                                                        <DatePicker
                                                            v-model="monetizationDetails.termDate"
                                                            is-required
                                                            @close="close"
                                                        />
                                                    </template>
                                                </UPopover>
                                                <template #error="{ error }">
                                                    <span
                                                        :class="[
                                                            error
                                                                ? 'text-red-500 dark:text-red-400'
                                                                : 'text-primary-500 dark:text-primary-400',
                                                        ]"
                                                    >
                                                        {{ isPerpetual || monetizationDetails.termDate ? '' : error }}
                                                    </span>
                                                </template>
                                            </UFormGroup>
                                            <UFormGroup :label="$t('data.designer.perpetual')">
                                                <UCheckbox
                                                    :model-value="isPerpetual"
                                                    class="mt-2.5 justify-center"
                                                    @update:model-value="(value: boolean) => updatePerpetual(value)"
                                                />
                                            </UFormGroup>
                                        </div>
                                    </div>
                                    <UFormGroup :label="$t('termsConditions')" name="extraTerms">
                                        <UTextarea
                                            v-model="monetizationDetails.extraTerms"
                                            :rows="4"
                                            :placeholder="$t('data.designer.typeTerms')"
                                            resize
                                        />
                                    </UFormGroup>
                                    <UFormGroup
                                        :label="$t('data.designer.additionalRenewalTerms')"
                                        name="additionalRenewalTerms"
                                    >
                                        <UTextarea
                                            v-model="monetizationDetails.additionalRenewalTerms"
                                            :rows="4"
                                            :placeholder="$t('data.designer.additionalRenewalTerms')"
                                            resize
                                        />
                                    </UFormGroup>
                                    <div class="flex flex-row gap-4">
                                        <div class="flex-1 flex gap-4">
                                            <UFormGroup
                                                :label="$t('data.designer.noticeForNonRenewal')"
                                                class="flex-1"
                                                required
                                                name="nonRenewalDays"
                                            >
                                                <UInput
                                                    v-model.number="monetizationDetails.nonRenewalDays"
                                                    :placeholder="$t('data.designer.noticeForNonRenewal')"
                                                    type="numeric"
                                                >
                                                    <template #trailing>
                                                        <span class="text-gray-500 text-xs">{{ t('days') }}</span>
                                                    </template>
                                                </UInput>
                                            </UFormGroup>
                                        </div>
                                        <div class="flex-1 flex gap-4">
                                            <UFormGroup
                                                :label="$t('data.designer.maximumDaysContractBreach')"
                                                class="flex-1"
                                                required
                                                name="contractBreachDays"
                                            >
                                                <UInput
                                                    v-model.number="monetizationDetails.contractBreachDays"
                                                    :placeholder="$t('data.designer.maximumDaysContractBreach')"
                                                    type="numeric"
                                                >
                                                    <template #trailing>
                                                        <span class="text-gray-500 text-xs">{{ t('days') }}</span>
                                                    </template>
                                                </UInput>
                                            </UFormGroup>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <div
                                            class="absolute right-0 top-0 text-sm flex gap-4 items-center font-semibold"
                                        >
                                            <span class="text-gray-700">
                                                {{ t('data.designer.hasPersonalData') }}
                                            </span>
                                            <UCheckbox
                                                :model-value="hasPersonalData"
                                                class="justify-center"
                                                @update:model-value="(value: boolean) => updatePersonal(value)"
                                            />
                                        </div>
                                        <UFormGroup
                                            :label="$t('data.designer.personalDataTerms')"
                                            name="personalDataTerms"
                                            :required="hasPersonalData"
                                        >
                                            <UTextarea
                                                v-model="monetizationDetails.personalDataTerms"
                                                :rows="4"
                                                :placeholder="$t('data.designer.personalDataTerms')"
                                                resize
                                                :disabled="!hasPersonalData"
                                            />
                                        </UFormGroup>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-if="monetizationDetails.type === 'subscription'">
                            <div class="flex flex-col space-y-5">
                                <div class="flex flex-row gap-4">
                                    <div class="flex gap-4 w-1/2">
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
                                    <UFormGroup :label="$t('license')" required class="w-1/2" name="license">
                                        <USelectMenu
                                            v-model="monetizationDetails.license"
                                            :class="'gray'"
                                            :placeholder="$t('data.designer.selectLicense')"
                                            :options="licenseSelections"
                                            ><template #label>
                                                <span v-if="monetizationDetails.license" class="truncate">{{
                                                    monetizationDetails.license
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
                                            v-model.number="monetizationDetails.limitNumber"
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
                                            v-model="monetizationDetails.limitFrequency"
                                            :placeholder="$t('data.designer.selectFrequency')"
                                            :options="limitFrequencySelections"
                                            value-attribute="value"
                                            option-attribute="title"
                                            ><template #label>
                                                <span v-if="monetizationDetails.limitFrequency" class="truncate">{{
                                                    monetizationDetails.limitFrequency
                                                }}</span>
                                                <span v-else class="text-gray-400">Select a frequency</span>
                                            </template></USelectMenu
                                        >
                                    </UFormGroup>
                                </div>
                                <div v-if="monetizationDetails.license === licenses.pistis" class="flex flex-col gap-4">
                                    <div class="flex flex-row gap-4">
                                        <div class="flex flex-1 gap-4">
                                            <UFormGroup :label="$t('exclusive')" name="isExclusive">
                                                <UCheckbox
                                                    v-model="monetizationDetails.isExclusive"
                                                    name="isExclusive"
                                                    class="mt-2.5 -ml-1 justify-center"
                                                />
                                            </UFormGroup>
                                            <UFormGroup
                                                :label="$t('data.designer.availability')"
                                                name="region"
                                                :required="!isWorldwide"
                                                class="w-full"
                                            >
                                                <UInput
                                                    v-model.number="monetizationDetails.region"
                                                    :class="isWorldwide ? 'opacity-50' : ''"
                                                    :disabled="isWorldwide"
                                                    :placeholder="$t('data.designer.regionCountry')"
                                                    type="numeric"
                                                    class="w-full"
                                                >
                                                </UInput>
                                            </UFormGroup>
                                            <UFormGroup :label="$t('data.designer.worldwide')">
                                                <UCheckbox
                                                    :model-value="isWorldwide"
                                                    class="mt-2.5 justify-center"
                                                    @update:model-value="(value: boolean) => updateWorldwide(value)"
                                                />
                                            </UFormGroup>
                                        </div>
                                        <div class="flex flex-1 gap-4">
                                            <UFormGroup
                                                :label="$t('data.designer.transferable')"
                                                required
                                                name="transferable"
                                                class="flex-1 text-gray-200"
                                            >
                                                <USelectMenu
                                                    v-model="monetizationDetails.transferable"
                                                    :ui="{
                                                        option: { active: 'text-gray-200' },
                                                        input: 'placeholder:text-gray-200 text-gray-200',
                                                        button: 'text-gray-200',
                                                    }"
                                                    :placeholder="$t('data.designer.transferable')"
                                                    :options="transferableSelections"
                                                    value-attribute="value"
                                                    option-attribute="label"
                                                ></USelectMenu>
                                            </UFormGroup>
                                            <UFormGroup
                                                :label="$t('data.designer.termDate')"
                                                :required="!isPerpetual"
                                                name="termDate"
                                                class="text-gray-200"
                                            >
                                                <UPopover :popper="{ placement: 'bottom-start' }">
                                                    <UButton
                                                        color="white"
                                                        icon="i-heroicons-calendar-days-20-solid"
                                                        :label="
                                                            monetizationDetails.termDate
                                                                ? dayjs(monetizationDetails.termDate).format(
                                                                      'DD MMMM YYYY',
                                                                  )
                                                                : isPerpetual
                                                                  ? t('data.designer.licenseIsPerpetual')
                                                                  : t('data.designer.pleaseSelectDate')
                                                        "
                                                        :disabled="isPerpetual"
                                                        :class="[
                                                            isPerpetual ? 'opacity-50' : '',
                                                            monetizationDetails.termDate
                                                                ? 'text-gray-700'
                                                                : 'text-gray-400',
                                                        ]"
                                                    />
                                                    <template #panel="{ close }">
                                                        <DatePicker
                                                            v-model="monetizationDetails.termDate"
                                                            is-required
                                                            @close="close"
                                                        />
                                                    </template>
                                                </UPopover>
                                                <template #error="{ error }">
                                                    <span
                                                        :class="[
                                                            error
                                                                ? 'text-red-500 dark:text-red-400'
                                                                : 'text-primary-500 dark:text-primary-400',
                                                        ]"
                                                    >
                                                        {{ isPerpetual || monetizationDetails.termDate ? '' : error }}
                                                    </span>
                                                </template>
                                            </UFormGroup>
                                            <UFormGroup :label="$t('data.designer.perpetual')">
                                                <UCheckbox
                                                    :model-value="isPerpetual"
                                                    class="mt-2.5 justify-center"
                                                    @update:model-value="(value: boolean) => updatePerpetual(value)"
                                                />
                                            </UFormGroup>
                                        </div>
                                    </div>
                                    <UFormGroup :label="$t('termsConditions')" name="extraTerms">
                                        <UTextarea
                                            v-model="monetizationDetails.extraTerms"
                                            :rows="4"
                                            :placeholder="$t('data.designer.typeTerms')"
                                            resize
                                        />
                                    </UFormGroup>
                                    <UFormGroup
                                        :label="$t('data.designer.additionalRenewalTerms')"
                                        name="additionalRenewalTerms"
                                    >
                                        <UTextarea
                                            v-model="monetizationDetails.additionalRenewalTerms"
                                            :rows="4"
                                            :placeholder="$t('data.designer.additionalRenewalTerms')"
                                            resize
                                        />
                                    </UFormGroup>
                                    <div class="flex flex-row gap-4">
                                        <div class="flex-1 flex gap-4">
                                            <UFormGroup
                                                :label="$t('data.designer.noticeForNonRenewal')"
                                                class="flex-1"
                                                required
                                                name="nonRenewalDays"
                                            >
                                                <UInput
                                                    v-model.number="monetizationDetails.nonRenewalDays"
                                                    :placeholder="$t('data.designer.noticeForNonRenewal')"
                                                    type="numeric"
                                                >
                                                    <template #trailing>
                                                        <span class="text-gray-500 text-xs">{{ t('days') }}</span>
                                                    </template>
                                                </UInput>
                                            </UFormGroup>
                                        </div>
                                        <div class="flex-1 flex gap-4">
                                            <UFormGroup
                                                :label="$t('data.designer.maximumDaysContractBreach')"
                                                class="flex-1"
                                                required
                                                name="contractBreachDays"
                                            >
                                                <UInput
                                                    v-model.number="monetizationDetails.contractBreachDays"
                                                    :placeholder="$t('data.designer.maximumDaysContractBreach')"
                                                    type="numeric"
                                                >
                                                    <template #trailing>
                                                        <span class="text-gray-500 text-xs">{{ t('days') }}</span>
                                                    </template>
                                                </UInput>
                                            </UFormGroup>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <div
                                            class="absolute right-0 top-0 text-sm flex gap-4 items-center font-semibold"
                                        >
                                            <span class="text-gray-700">
                                                {{ t('data.designer.hasPersonalData') }}
                                            </span>
                                            <UCheckbox
                                                :model-value="hasPersonalData"
                                                class="justify-center"
                                                @update:model-value="(value: boolean) => updatePersonal(value)"
                                            />
                                        </div>
                                        <UFormGroup
                                            :label="$t('data.designer.personalDataTerms')"
                                            name="personalDataTerms"
                                            :required="hasPersonalData"
                                        >
                                            <UTextarea
                                                v-model="monetizationDetails.personalDataTerms"
                                                :rows="4"
                                                :placeholder="$t('data.designer.personalDataTerms')"
                                                resize
                                                :disabled="!hasPersonalData"
                                            />
                                        </UFormGroup>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- <template v-if="monetizationDetails.type === 'investment'">
                        </template>

                        <template v-if="monetizationDetails.type === 'nft'">
                        </template> -->

                        <!-- Terms Document -->
                        <div v-show="monetizationDetails.license">
                            <p class="font-semibold text-sm mt-5 mb-1.5">{{ $t('licenseDetails') }}</p>
                            <DataShareTerms
                                :asset-offering-details="assetOfferingDetails"
                                :monetization-details="monetizationDetails"
                                @update:contract-terms="(value: string) => updateContractTerms(value)"
                            />
                        </div>

                        <div class="w-full flex items-center justify-between mt-4">
                            <UButton size="md" color="gray" variant="outline" @click="emit('changePage', 0)">
                                {{ $t('back') }}
                            </UButton>
                            <UButton size="md" type="submit" @click="onSubmit">{{ $t('next') }} </UButton>
                        </div>
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
