<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import type CardSelection from '~/interfaces/card-selection';
import { SubscriptionFrequency } from '~/interfaces/subscription-frequency.enum';
import { UpdateFrequency } from '~/interfaces/update-frequency.enum';

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

const props = defineProps({
    monetizationDetailsProp: {
        type: Object as PropType<Partial<monetizationType>>,
        required: true,
    },
    assetOfferingDetails: {
        type: Object,
        required: true,
    },
    assetOnMarketplace: {
        type: Boolean,
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

const assetOfferingDetailsSchema = z.object({
    title: z.string().min(1, t('required', { count: 1 })),
    description: z.string().min(1, t('required', { count: 1 })),
    selectedDistribution: z.object({
        label: z.string(),
        id: z.string(),
        format: z
            .object({
                id: z.string(),
                label: z.string().optional(),
                resource: z.string().optional(),
            })
            .optional(),
        access_url: z.array(z.string()).optional(),
        title: z.object({
            en: z.string(),
        }),
    }),
});

const isAssetOfferingDetailsValid = computed(() => {
    return assetOfferingDetailsSchema.safeParse(props.assetOfferingDetails).success &&
        monetizationDetails.value.type === 'nft'
        ? true
        : props.assetOfferingDetails.keywords.length > 0;
});

const updateFrequencySelections = [
    {
        label: t('data.designer.hourly'),
        value: UpdateFrequency.HOURLY,
    },
    {
        label: t('data.designer.daily'),
        value: UpdateFrequency.DAILY,
    },
    {
        label: t('data.designer.weekly'),
        value: UpdateFrequency.WEEKLY,
    },
    {
        label: t('data.designer.monthly'),
        value: UpdateFrequency.MONTHLY,
    },
];

const resetMonetization = (monetizationType: 'one-off' | 'subscription' | 'nft') => {
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
            subscriptionFrequency: '',
            price: '',
            updateFrequency: '',
        };
    } else if (monetizationType === 'nft') {
        monetizationDetails.value = {
            type: 'nft',
            price: '',
        };
    }
};

const monetizationToSend = ref();

const monetizationSelections: CardSelection[] = [
    {
        title: t('data.designer.oneOffSale'),
        value: 'one-off',
        disabled: false,
    },
    {
        title: t('data.designer.subscription'),
        value: 'subscription',
        disabled: false,
    },
    {
        title: t('data.designer.nft'),
        value: 'nft',
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
    monetizationDetails.value.price = 0;
};

const handleMonetizationClick = (value: string) => {
    monetizationToSend.value = value;
    resetMonetization(monetizationToSend.value);
};

async function onSubmit(): Promise<void> {
    if (monetizationDetails.value.type === 'nft' && props.assetOnMarketplace) {
        showErrorMessage(t('data.designer.nftNotPossible'));
    } else if (isMonetizationValid.value && isAssetOfferingDetailsValid.value) {
        emit('changePage', 2);
    } else {
        if (props.assetOfferingDetails.keywords.length < 1) {
            showErrorMessage(t('data.designer.pleaseKeywords'));
        }
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

//NFT Functionality

//TODO: Make call to see if NFT of this dataset already exists (not allowed to make NFT)
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
                    <UIcon name="material-symbols:monetization-on" class="w-10 h-10 text-gray-500 -mr-4" />
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
                                    :label="$t('data.designer.price')"
                                    :required="!isFree"
                                    name="price"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    eager-validation
                                >
                                    <UInput
                                        v-model.number="monetizationDetails.price"
                                        :class="isFree ? 'opacity-50 w-[328px]' : 'w-[328px]'"
                                        :disabled="isFree"
                                        :placeholder="$t('data.designer.price')"
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

                                <UDivider orientation="vertical" class="mx-5 mt-6"></UDivider>
                                <UFormGroup name="free" :ui="{ error: 'absolute -bottom-6' }" eager-validation>
                                    <div class="flex gap-2 items-center text-sm mt-[30px]">
                                        <span class="font-semibold">{{ $t('data.designer.free') }}</span>
                                        <UCheckbox
                                            :model-value="isFree"
                                            name="subscriptionFree"
                                            class="flex-1 justify-center"
                                            @update:model-value="(value: boolean) => updateFree(value)"
                                        />
                                    </div>
                                </UFormGroup>
                            </div>
                        </div>
                    </div>
                </template>

                <template v-if="monetizationDetails.type === 'subscription'">
                    <div class="flex flex-col space-y-5">
                        <div class="flex flex-row gap-4">
                            <div class="flex gap-4 w-full">
                                <div class="flex gap-4">
                                    <UFormGroup
                                        :label="$t('data.designer.price')"
                                        :required="!isFree"
                                        name="price"
                                        :ui="{ error: 'absolute -bottom-6 flex' }"
                                        eager-validation
                                    >
                                        <UInput
                                            v-model.number="monetizationDetails.price"
                                            :class="isFree ? 'opacity-50' : ''"
                                            :disabled="isFree"
                                            :placeholder="$t('data.designer.price')"
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
                                    <span class="mt-7 text-sm">per</span>
                                </div>
                                <UFormGroup required name="subscriptionFrequency" eager-validation>
                                    <div class="flex gap-2 mt-7">
                                        <URadio
                                            v-for="selection in [
                                                {
                                                    label: $t('data.designer.month'),
                                                    value: SubscriptionFrequency.MONTHLY,
                                                },
                                                {
                                                    label: $t('data.designer.year'),
                                                    value: SubscriptionFrequency.ANNUAL,
                                                },
                                            ]"
                                            :key="selection.value"
                                            v-model="monetizationDetails.subscriptionFrequency"
                                            v-bind="selection"
                                        >
                                        </URadio>
                                    </div>
                                </UFormGroup>
                                <UDivider orientation="vertical" class="mx-5 mt-6"></UDivider>
                                <UFormGroup name="free" :ui="{ error: 'absolute -bottom-6' }" eager-validation>
                                    <div class="flex gap-2 items-center text-sm mt-7">
                                        <span class="font-semibold">{{ $t('data.designer.free') }}</span>
                                        <UCheckbox
                                            :model-value="isFree"
                                            name="subscriptionFree"
                                            class="flex-1 justify-center"
                                            @update:model-value="(value: boolean) => updateFree(value)"
                                        />
                                    </div>
                                </UFormGroup>
                            </div>
                        </div>

                        <div>
                            <UFormGroup
                                :label="$t('data.designer.dataUpdated')"
                                name="updateFrequency"
                                required
                                eager-validation
                            >
                                <div class="flex items-center gap-2">
                                    <URadio
                                        v-for="selection in updateFrequencySelections"
                                        :key="selection.value"
                                        v-model="monetizationDetails.updateFrequency"
                                        v-bind="selection"
                                    >
                                    </URadio>
                                </div>
                            </UFormGroup>
                        </div>
                    </div>
                </template>

                <template v-if="monetizationDetails.type === 'nft'">
                    <div class="flex flex-col space-y-5">
                        <UAlert
                            v-if="$props.assetOnMarketplace"
                            icon="nimbus:forbidden"
                            class="p-6 border border-red-200"
                            :description="$t('data.designer.nftNotPossible')"
                            color="red"
                            variant="subtle"
                        />
                        <UAlert
                            class="p-6 border border-yellow-200"
                            icon="material-symbols:warning-outline-rounded"
                            :title="$t('data.designer.nftWarning')"
                            :description="$t('data.designer.nftWarningText')"
                            color="yellow"
                            variant="subtle"
                        />
                        <div class="flex flex-row gap-4">
                            <div class="flex-1 flex gap-4">
                                <UFormGroup
                                    :label="$t('data.designer.price')"
                                    required
                                    name="price"
                                    :ui="{ error: 'absolute -bottom-6' }"
                                    eager-validation
                                >
                                    <UInput
                                        v-model.number="monetizationDetails.price"
                                        :class="'w-[328px]'"
                                        :disabled="isFree"
                                        :placeholder="$t('data.designer.price')"
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
                                            {{ error }}
                                        </span>
                                    </template>
                                </UFormGroup>
                            </div>
                        </div>
                    </div>
                </template>
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
