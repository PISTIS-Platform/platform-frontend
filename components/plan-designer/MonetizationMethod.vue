<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import type CardSelection from '~/interfaces/card-selection';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';
import { SubscriptionFrequency } from '~/interfaces/subscription-frequency.enum';

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

const props = defineProps({
    isAllValid: {
        type: Boolean,
        required: true,
    },
    monDet: {
        type: Object as PropType<Partial<monetizationType>>,
        required: true,
    },
});

const { isFree, monetizationSchema } = useMonetizationSchema();

type monetizationType = z.infer<typeof monetizationSchema>;

//use computed getter and setter to avoid prop mutation
const monetizationDetails = computed({
    get() {
        return props.monDet;
    },
    set(newValue: Partial<monetizationType>) {
        emit('update:mon-det', newValue);
    },
});

const resetMonetization = (monetizationType: 'one-off' | 'subscription' | 'investment' | 'nft') => {
    isFree.value = false;
    if (monetizationType === 'one-off') {
        emit('update:mon-det', {
            type: 'one-off',
            price: '',
            license: '',
            terms: '',
            limitNumber: '',
            limitFrequency: '',
        });
    } else if (monetizationType === 'subscription') {
        emit('update:mon-det', {
            type: 'subscription',
            frequency: '',
            price: '',
            license: '',
            terms: '',
            limitNumber: '',
            limitFrequency: '',
        });
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

const licenseSelections: string[] = ['CC-BY', 'MIT', 'CC0'];

const limitFrequencySelections = computed(() => [
    { title: t('perHour'), value: DownloadFrequency.HOUR },
    { title: t('perDay'), value: DownloadFrequency.DAY },
    { title: t('perWeek'), value: DownloadFrequency.WEEK },
    { title: t('perMonth'), value: DownloadFrequency.MONTH },
    { title: t('perYear'), value: DownloadFrequency.YEAR },
]);

const emit = defineEmits(['update:mon-det', 'changePage']);

const formRef = ref();

const updateFree = (value: boolean) => {
    isFree.value = value;

    if (isFree.value) {
        emit('update:mon-det', {
            ...monetizationDetails.value,
            price: 0,
        });
    } else {
        emit('update:mon-det', {
            ...monetizationDetails.value,
            price: '',
        });
    }
};

const handleMonetizationClick = (value: string) => {
    switchWarningOpen.value = true;
    monetizationToSend.value = value;
};

async function onSubmit(): Promise<void> {
    if (props.isAllValid) {
        emit('changePage', 2);
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
                <SubHeading
                    :title="$t('data.designer.monetizationMethod')"
                    :info="$t('data.designer.monetizationMethodInfo')"
                />
            </template>
            <div class="space-y-5">
                <SelectionCards
                    :model-value="monetizationDetails.type"
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
                        :schema="monetizationSchema"
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
                                                v-model="monetizationDetails.price"
                                                :class="isFree ? 'opacity-50' : ''"
                                                :disabled="isFree"
                                                :placeholder="$t('data.designer.oneOffPrice')"
                                                type="numeric"
                                            >
                                                <template #trailing>
                                                    <span class="text-gray-500 text-xs">STC</span>
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
                                            v-model="monetizationDetails.limitNumber"
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
                                <UFormGroup :label="$t('termsConditions')" required name="terms">
                                    <UTextarea
                                        v-model="monetizationDetails.terms"
                                        :rows="4"
                                        :placeholder="$t('data.designer.typeTerms')"
                                        resize
                                        icon="i-heroicons-envelope"
                                    />
                                </UFormGroup>
                            </div>
                        </template>

                        <template v-if="monetizationDetails.type === 'subscription'">
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
                                                    v-model="monetizationDetails.frequency"
                                                    :label="$t('data.designer.monthly')"
                                                    :value="SubscriptionFrequency.MONTHLY"
                                                />
                                                <URadio
                                                    v-model="monetizationDetails.frequency"
                                                    :label="$t('data.designer.annual')"
                                                    :value="SubscriptionFrequency.ANNUAL"
                                                />
                                            </div>
                                        </UFormGroup>
                                        <div class="flex-1 flex gap-4">
                                            <UFormGroup
                                                :label="$t('data.designer.subscriptionPrice')"
                                                class="flex-1"
                                                :required="!isFree"
                                                name="price"
                                            >
                                                <UInput
                                                    v-model="monetizationDetails.price"
                                                    :class="isFree ? 'opacity-50' : ''"
                                                    :disabled="isFree"
                                                    :placeholder="$t('data.designer.subscriptionPricePH')"
                                                    type="numeric"
                                                >
                                                    <template #trailing>
                                                        <span class="text-gray-500 text-xs">STC</span>
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
                                            v-model="monetizationDetails.limitNumber"
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

                                <UFormGroup :label="$t('termsConditions')" required name="terms">
                                    <UTextarea
                                        v-model="monetizationDetails.terms"
                                        resize
                                        :rows="4"
                                        :placeholder="$t('data.designer.typeTerms')"
                                        icon="i-heroicons-envelope"
                                    />
                                </UFormGroup>
                            </div>
                        </template>

                        <template v-if="monetizationDetails.type === 'investment'">
                            <!--TODO: Figure out what goes here when investment gets activated-->
                        </template>

                        <template v-if="monetizationDetails.type === 'nft'">
                            <div class="flex flex-col space-y-5">
                                <UFormGroup :label="$t('data.designer.nftPrice')" required name="price">
                                    <UInput
                                        v-model="monetizationDetails.price"
                                        :placeholder="$t('price')"
                                        type="numeric"
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
                        </template>
                        <div class="w-full flex items-center justify-between mt-4">
                            <UButton size="md" color="gray" variant="outline" @click="emit('changePage', 0)">
                                {{ $t('back') }}
                            </UButton>
                            <UButton size="md" type="submit">{{ $t('next') }} </UButton>
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
                        emit('update:monetization-selection', monetizationToSend);
                        resetMonetization(monetizationToSend);
                        switchWarningOpen = false;
                    "
                    >{{ $t('yes') }}</UButton
                >
            </div>
        </UCard>
    </UModal>
</template>
