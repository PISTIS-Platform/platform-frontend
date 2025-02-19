<script setup lang="ts">
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import { licenses } from '~/constants/licenses';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

import { countriesInEnglish } from '~/constants/countries';

const listOfCountries = Object.values(countriesInEnglish);

const props = defineProps({
    licenseDetailsProp: {
        type: Object as PropType<Partial<licenseType>>,
        required: true,
    },
    monetizationDetails: {
        type: Object as PropType<Partial<monetizationType>>,
        required: true,
    },
    assetOfferingDetails: {
        type: Object,
        required: true,
    },
    isFree: {
        type: Boolean,
    },
});

const { monetizationSchema } = useMonetizationSchema();
type monetizationType = z.infer<typeof monetizationSchema>;

//use computed getter and setter to avoid prop mutation
const licenseDetails = computed({
    get() {
        return props.licenseDetailsProp;
    },
    set(newValue: Partial<licenseType>) {
        emit('update:license-details-prop', newValue);
    },
});

const isLicenseValid = computed(() => {
    return licenseSchema.safeParse(licenseDetails.value).success;
});

const isAllValid = computed(() => isLicenseValid.value);

const { isWorldwide, isPerpetual, hasPersonalData, licenseSchema } = useLicenseSchema();

type licenseType = z.infer<typeof licenseSchema>;

const licenseSelections = computed(() => (props.isFree ? Object.values(licenses) : [licenses.pistis]));

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
    'update:license-details-prop',
    'update:is-free',
    'update:is-worldwide',
    'update:is-perpetual',
    'update:has-personal-data',
    'changePage',
    'update:isAllValid',
]);

const formRef = ref();

const updateWorldwide = (value: boolean) => {
    isWorldwide.value = value;
    emit('update:is-worldwide', value);
    if (isWorldwide.value) {
        licenseDetails.value.region = [];
    }
};

const updatePerpetual = (value: boolean) => {
    isPerpetual.value = value;
    emit('update:is-perpetual', value);
    if (isPerpetual.value) {
        licenseDetails.value.termDate = undefined;
    }
};

const updatePersonal = (value: boolean) => {
    hasPersonalData.value = value;
    emit('update:has-personal-data', value);
    if (!hasPersonalData.value) {
        licenseDetails.value.personalDataTerms = '';
    }
};

const updateContractTerms = (value: string) => {
    licenseDetails.value.contractTerms = value;
};

const customValidate = () => {
    const errors = [];
    emit('update:isAllValid', isAllValid.value);
    //TODO: Somehow get to AssetOfferingDetails component
    const licenseTotalErrors = licenseSchema.safeParse(licenseDetails.value).error?.issues;
    if (licenseTotalErrors?.length) {
        for (const error of licenseTotalErrors) {
            if (error.path[0] === 'contractTerms') continue;
            errors.push({ path: error.path[0], message: error.message });
        }
    }
    if (!isWorldwide.value && !licenseDetails.value.region.length)
        errors.push({ path: 'region', message: t('val.required') });
    else formRef.value.clear('region');
    if (!isPerpetual.value && !licenseDetails.value.termDate)
        errors.push({ path: 'termDate', message: t('val.required') });
    if (!licenseDetails.value.transferable) errors.push({ path: 'transferable', message: t('val.required') });
    if (!licenseDetails.value.nonRenewalDays) errors.push({ path: 'nonRenewalDays', message: t('val.positive') });
    if (!licenseDetails.value.contractBreachDays)
        errors.push({ path: 'contractBreachDays', message: t('val.positive') });
    if (hasPersonalData.value && !licenseDetails.value.personalDataTerms)
        errors.push({ path: 'personalDataTerms', message: t('val.required') });

    return errors;
};

async function onSubmit(): Promise<void> {
    if (isLicenseValid.value) {
        emit('changePage', 3);
    } else {
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
                <div class="flex items-center gap-8">
                    <UIcon name="clarity:license-solid" class="w-10 h-10 text-gray-500" />
                    <SubHeading
                        :title="$t('data.designer.licenseSelector')"
                        :info="$t('data.designer.licenseSelectorInfo')"
                    />
                </div>
            </template>
            <div class="space-y-5">
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
                        class="flex flex-col w-full"
                        :state="licenseDetails"
                        :validate="customValidate"
                        @submit="onSubmit"
                    >
                        <div class="flex flex-col space-y-5">
                            <div class="flex flex-row gap-4">
                                <UFormGroup
                                    :label="$t('license')"
                                    required
                                    name="license"
                                    class="flex-1 text-gray-200"
                                    eager-validation
                                >
                                    <USelectMenu
                                        v-model="licenseDetails.license"
                                        :ui="{
                                            option: { active: 'text-gray-200' },
                                            input: 'placeholder:text-gray-200 text-gray-200',
                                            button: 'text-gray-200',
                                        }"
                                        :placeholder="$t('data.designer.selectLicense')"
                                        :options="licenseSelections"
                                        ><template #label>
                                            <span v-if="licenseDetails.license" class="truncate">{{
                                                licenseDetails.license
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
                                    eager-validation
                                >
                                    <UInput
                                        v-model.number="licenseDetails.limitNumber"
                                        :placeholder="$t('data.designer.downloadLimitPH')"
                                        type="numeric"
                                    >
                                        <template #trailing>
                                            <span class="text-gray-500 text-xs">{{ $t('times') }}</span>
                                        </template>
                                    </UInput>
                                </UFormGroup>
                                <UFormGroup
                                    :label="$t('frequency')"
                                    required
                                    name="limitFrequency"
                                    class="flex-1"
                                    eager-validation
                                >
                                    <USelectMenu
                                        v-model="licenseDetails.limitFrequency"
                                        :placeholder="$t('data.designer.selectFrequency')"
                                        :options="limitFrequencySelections"
                                        value-attribute="value"
                                        option-attribute="title"
                                        ><template #label>
                                            <span v-if="licenseDetails.limitFrequency" class="truncate">{{
                                                licenseDetails.limitFrequency
                                            }}</span>
                                            <span v-else class="text-gray-400">Select a frequency</span>
                                        </template></USelectMenu
                                    >
                                </UFormGroup>
                            </div>
                            <div v-if="licenseDetails.license === licenses.pistis" class="flex flex-col gap-4">
                                <div class="flex flex-row gap-4">
                                    <div class="flex flex-1 gap-4">
                                        <UFormGroup :label="$t('exclusive')" name="isExclusive" eager-validation>
                                            <UCheckbox
                                                v-model="licenseDetails.isExclusive"
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
                                            <USelectMenu
                                                v-model="licenseDetails.region"
                                                searchable
                                                :searchable-placeholder="$t('data.designer.searchForACountry')"
                                                :options="listOfCountries"
                                                :placeholder="$t('data.designer.regionCountry')"
                                                multiple
                                                :disabled="isWorldwide"
                                                class="disabled:opacity-50"
                                            />

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
                                        <UFormGroup :label="$t('data.designer.worldwide')" eager-validation>
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
                                            eager-validation
                                        >
                                            <USelectMenu
                                                v-model="licenseDetails.transferable"
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
                                            eager-validation
                                        >
                                            <UPopover :popper="{ placement: 'bottom-start' }">
                                                <UButton
                                                    color="white"
                                                    icon="i-heroicons-calendar-days-20-solid"
                                                    :label="
                                                        licenseDetails.termDate
                                                            ? dayjs(licenseDetails.termDate).format('DD MMMM YYYY')
                                                            : isPerpetual
                                                              ? t('data.designer.licenseIsPerpetual')
                                                              : t('data.designer.pleaseSelectDate')
                                                    "
                                                    :disabled="isPerpetual"
                                                    :class="[
                                                        isPerpetual ? 'opacity-50' : '',
                                                        licenseDetails.termDate ? 'text-gray-700' : 'text-gray-400',
                                                    ]"
                                                />
                                                <template #panel="{ close }">
                                                    <DatePicker
                                                        v-model="licenseDetails.termDate"
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
                                                    {{ isPerpetual || licenseDetails.termDate ? '' : error }}
                                                </span>
                                            </template>
                                        </UFormGroup>
                                        <UFormGroup :label="$t('data.designer.perpetual')" eager-validation>
                                            <UCheckbox
                                                :model-value="isPerpetual"
                                                class="mt-2.5 justify-center"
                                                @update:model-value="(value: boolean) => updatePerpetual(value)"
                                            />
                                        </UFormGroup>
                                    </div>
                                </div>
                                <UFormGroup :label="$t('termsConditions')" name="extraTerms" eager-validation>
                                    <UTextarea
                                        v-model="licenseDetails.extraTerms"
                                        :rows="4"
                                        :placeholder="$t('data.designer.typeTerms')"
                                        resize
                                    />
                                </UFormGroup>
                                <UFormGroup
                                    :label="$t('data.designer.additionalRenewalTerms')"
                                    name="additionalRenewalTerms"
                                    eager-validation
                                >
                                    <UTextarea
                                        v-model="licenseDetails.additionalRenewalTerms"
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
                                            eager-validation
                                        >
                                            <UInput
                                                v-model.number="licenseDetails.nonRenewalDays"
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
                                            eager-validation
                                        >
                                            <UInput
                                                v-model.number="licenseDetails.contractBreachDays"
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
                                    <div class="absolute right-0 top-0 text-sm flex gap-4 items-center font-semibold">
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
                                        eager-validation
                                    >
                                        <UTextarea
                                            v-model="licenseDetails.personalDataTerms"
                                            :rows="4"
                                            :placeholder="$t('data.designer.personalDataTerms')"
                                            resize
                                            :disabled="!hasPersonalData"
                                        />
                                    </UFormGroup>
                                </div>
                            </div>
                        </div>

                        <!-- Terms Document -->
                        <div v-show="licenseDetails.license">
                            <p class="font-semibold text-sm mt-5 mb-1.5">{{ $t('licenseDetails') }}</p>
                            <DataShareTerms
                                :asset-offering-details="props.assetOfferingDetails"
                                :monetization-details="props.monetizationDetails"
                                :license-details="licenseDetails"
                                @update:contract-terms="(value: string) => updateContractTerms(value)"
                            />
                        </div>

                        <div class="w-full flex items-center justify-between mt-4">
                            <UButton size="md" color="gray" variant="outline" @click="emit('changePage', 1)">
                                {{ $t('back') }}
                            </UButton>
                            <UButton size="md" type="submit" @click="onSubmit">{{ $t('next') }} </UButton>
                        </div>
                    </UForm>
                </Transition>
            </div>
        </UCard>
    </Transition>
</template>
