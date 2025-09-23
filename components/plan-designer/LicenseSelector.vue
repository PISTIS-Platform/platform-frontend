<script setup lang="ts">
import * as R from 'ramda';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import { LicenseCode, licenses } from '~/constants/licenses';

const codeSort = R.sortWith([R.ascend(R.prop('code'))]);

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

import { countries } from '~/constants/countries';

//NOTE: Value will be the shorthand, label is translatable
const listOfCountries = Object.keys(countries).map((countryShorthand: string) => ({
    label: t(`countries.${countryShorthand}`),
    value: countryShorthand,
}));

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

const monetizationPropComputed = computed(() => props.monetizationDetails);

watch(
    monetizationPropComputed,
    () => {
        if (monetizationPropComputed.value.type === 'nft') {
            resetLicenseDetails({
                code: LicenseCode.NFT,
                label: 'NFT License',
                description: licenses.find((license) => license.code === LicenseCode.NFT)?.description,
            });
        } else {
            if (!props.isFree) {
                resetLicenseDetails({
                    code: LicenseCode.PISTIS,
                    label: 'PISTIS License - Custom PISTIS License',
                    description: '',
                });
            } else {
                resetLicenseDetails(licenses[0]);
            }
        }
    },
    { deep: true },
);

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

const { isWorldwide, hasPersonalData, licenseSchema, durationSelections } = useLicenseSchema();

type licenseType = z.infer<typeof licenseSchema>;

const licenseSelections = computed(() =>
    props.isFree
        ? codeSort([...licenses])
        : props.monetizationDetails.type === 'nft'
          ? [
                {
                    code: LicenseCode.NFT,
                    label: 'NFT License',
                    description: licenses.find((license) => license.code === LicenseCode.NFT)?.description,
                },
            ]
          : [
                {
                    code: LicenseCode.PISTIS,
                    label: 'PISTIS License - Custom PISTIS License',
                    description: '',
                },
            ],
);

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

const isOpen = ref(false);

const licenseRef = ref<{ code: string; label: string; description?: string } | null>(null);

const resetLicenseDetails = (license: { code: string; label: string; description?: string } | undefined) => {
    if (!license) return;

    isOpen.value = false;
    licenseRef.value = license;

    if (license.code === LicenseCode.PISTIS) {
        licenseDetails.value = {
            license: LicenseCode.PISTIS,
            extraTerms: '',
            contractTerms: '',
            isExclusive: false,
            region: [],
            transferable: '',
            duration: '',
            perpetual: '',
            noUseWithBlacklistedDatasets: false,
            additionalRenewalTerms: '',
            nonRenewalDays: '',
            contractBreachDays: '',
            personalDataTerms: '',
        };
    } else if (license.code === LicenseCode.NFT) {
        licenseDetails.value = {
            license: LicenseCode.NFT,
        };
    } else {
        licenseDetails.value = {
            license: license.code,
        };
    }
};

const customValidate = () => {
    const errors = [];
    emit('update:isAllValid', isAllValid.value);
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
    if (!licenseDetails.value.duration) errors.push({ path: 'duration', message: t('val.required') });
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

const licenseToSwitchTo = ref<{ code: string; label: string; description?: string }>();

const handleLicenseUpdate = (license: { code: string; label: string; description?: string }) => {
    licenseToSwitchTo.value = license;
    isOpen.value = true;
};
</script>

<template>
    <UCard>
        <template #header>
            <div class="flex items-center gap-8">
                <UIcon name="clarity:license-solid" class="w-10 h-10 text-gray-500 -mr-4" />
                <SubHeading
                    :title="$t('data.designer.licenseSelector')"
                    :info="$t('data.designer.licenseSelectorInfo')"
                />
            </div>
        </template>
        <div class="space-y-6">
            <UForm
                ref="formRef"
                class="flex flex-col w-full"
                :state="licenseDetails"
                :validate="customValidate"
                @submit="onSubmit"
            >
                <div class="flex flex-col space-y-6">
                    <div class="flex flex-row gap-4">
                        <UFormGroup
                            :label="$t('license')"
                            required
                            name="license"
                            class="flex-1 text-gray-200"
                            :ui="{ error: 'absolute -bottom-6' }"
                            eager-validation
                        >
                            <USelectMenu
                                :model-value="licenseRef"
                                :ui="{
                                    option: { active: 'text-gray-200' },
                                    input: 'placeholder:text-gray-200 text-gray-200',
                                    button: 'text-gray-200',
                                }"
                                searchable
                                :searchable-placeholder="$t('data.designer.searchForALicense')"
                                :placeholder="$t('data.designer.selectLicense')"
                                :options="licenseSelections"
                                @update:model-value="
                                    (value) =>
                                        value.code === licenseDetails.license ? null : handleLicenseUpdate(value)
                                "
                            ></USelectMenu>
                        </UFormGroup>
                    </div>
                    <div v-if="licenseDetails.license === LicenseCode.PISTIS" class="flex flex-col space-y-6">
                        <div class="flex flex-1 gap-4">
                            <UFormGroup
                                :label="$t('exclusive')"
                                name="isExclusive"
                                :ui="{ error: 'absolute -bottom-6' }"
                                eager-validation
                            >
                                <UCheckbox
                                    v-model="licenseDetails.isExclusive"
                                    name="isExclusive"
                                    class="mt-2.5 -ml-1 justify-center"
                                />
                            </UFormGroup>
                            <UFormGroup
                                :label="$t('data.designer.noUseWithBlacklistedDatasets')"
                                name="noUseWithBlacklistedDatasets"
                                :ui="{ error: 'absolute -bottom-6' }"
                                eager-validation
                            >
                                <template #label>
                                    <div class="w-full bg-red-500">
                                        {{ $t('data.designer.noUseWithBlacklistedDatasets') }}
                                    </div>
                                </template>
                                <UCheckbox
                                    v-model="licenseDetails.noUseWithBlacklistedDatasets"
                                    name="noUseWithBlacklistedDatasets"
                                    class="mt-2.5 justify-center"
                                />
                            </UFormGroup>
                            <UFormGroup
                                :label="$t('data.designer.availability')"
                                name="region"
                                :required="!isWorldwide"
                                :ui="{ error: 'absolute -bottom-6' }"
                                class="w-full"
                                eager-validation
                            >
                                <USelectMenu
                                    v-model="licenseDetails.region"
                                    searchable
                                    :searchable-placeholder="$t('data.designer.searchForACountry')"
                                    :options="listOfCountries"
                                    :placeholder="$t('data.designer.regionCountry')"
                                    multiple
                                    :disabled="isWorldwide"
                                    value-attribute="value"
                                    option-attribute="label"
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
                            <UFormGroup
                                :label="$t('data.designer.worldwide')"
                                :ui="{ error: 'absolute -bottom-6' }"
                                eager-validation
                            >
                                <UCheckbox
                                    :model-value="isWorldwide"
                                    class="mt-2.5 justify-center"
                                    @update:model-value="(value: boolean) => updateWorldwide(value)"
                                />
                            </UFormGroup>
                            <UFormGroup
                                :label="$t('data.designer.transferable')"
                                required
                                name="transferable"
                                class="text-gray-200 w-full"
                                :ui="{ error: 'absolute -bottom-6' }"
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
                                :label="$t('data.designer.duration.title')"
                                name="duration"
                                required
                                class="w-full"
                                :ui="{ error: 'absolute -bottom-6' }"
                                eager-validation
                            >
                                <USelectMenu
                                    v-model="licenseDetails.duration"
                                    :options="durationSelections"
                                    :placeholder="$t('data.designer.duration.title')"
                                    value-attribute="value"
                                    option-attribute="label"
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
                                        {{ error }}
                                    </span>
                                </template>
                            </UFormGroup>
                        </div>

                        <UFormGroup
                            :label="$t('termsConditions')"
                            name="extraTerms"
                            :ui="{ error: 'absolute -bottom-6' }"
                            eager-validation
                        >
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
                            :ui="{ error: 'absolute -bottom-6' }"
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
                                    :ui="{ error: 'absolute -bottom-6' }"
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
                                    :ui="{ error: 'absolute -bottom-6' }"
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
                                :ui="{ error: 'absolute -bottom-6' }"
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
                        v-show="licenseDetails.license === LicenseCode.PISTIS"
                        :asset-offering-details="props.assetOfferingDetails"
                        :monetization-details="props.monetizationDetails"
                        :license-details="licenseDetails"
                        @update:contract-terms="(value: string) => updateContractTerms(value)"
                    />
                    <div v-show="licenseDetails.license !== LicenseCode.PISTIS" class="border rounded-md p-4">
                        {{ licenseRef?.description }}
                    </div>
                </div>

                <div class="w-full flex items-center justify-between mt-4">
                    <UButton size="md" color="gray" variant="outline" @click="emit('changePage', 1)">
                        {{ $t('back') }}
                    </UButton>
                    <UButton size="md" type="submit" @click="onSubmit">{{ $t('next') }} </UButton>
                </div>
            </UForm>
        </div>
    </UCard>
    <UModal v-model="isOpen" :ui="{ width: 'w-96' }">
        <div class="p-4 flex flex-col gap-4 items-center">
            <span class="font-bold text-gray-500 text-lg">{{ $t('data.designer.areYouSure') }}</span>
            <span class="text-gray-500">{{ $t('data.designer.willReset') }}</span>
            <div class="flex w-full items-center justify-between">
                <UButton color="white" @click="isOpen = false">{{ t('cancel') }}</UButton>
                <UButton @click="resetLicenseDetails(licenseToSwitchTo)">{{
                    t('data.designer.changeLicense')
                }}</UButton>
            </div>
        </div>
    </UModal>
</template>
