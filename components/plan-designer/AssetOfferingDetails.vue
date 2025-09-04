<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();

const props = defineProps({
    assetDetailsProp: {
        type: Object,
        required: true,
    },
    monetizationDetails: {
        type: Object,
        required: true,
    },
});

const { MonetizationType } = useMonetizationSchema();

const emit = defineEmits(['update:asset-details-prop', 'update:asset-keywords', 'isValid', 'changePage']);

const schema = z.object({
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

//use computed getter and setter to avoid prop mutation
const assetOfferingDetails = computed({
    get() {
        return props.assetDetailsProp;
    },
    set(newValue) {
        emit('update:asset-details-prop', newValue);
    },
});

const customValidate = () => {
    const assetErrors = [];
    const assetTotalErrors = schema.safeParse(assetOfferingDetails.value).error?.issues;
    if (assetTotalErrors?.length) {
        for (const error of assetTotalErrors) {
            assetErrors.push({ path: error.path[0], message: error.message });
        }
    }
    if (!assetOfferingDetails.value.keywords?.length) assetErrors.push({ path: 'keywords', message: t('required') });
    return assetErrors;
};

const formRef = ref();

watch(
    () => assetOfferingDetails.value.keywords,
    () => {
        if (assetOfferingDetails.value.keywords.length >= 1) {
            formRef.value.clear('keywords');
        } else {
            formRef.value.setErrors([{ path: 'keywords', message: t('required') }], 'keywords');
        }
    },
);
</script>

<template>
    <UForm
        ref="formRef"
        class="flex flex-col space-y-5 w-full"
        :state="assetOfferingDetails"
        :schema="schema"
        :validate="customValidate"
    >
        <UCard>
            <template #header>
                <div class="flex items-center gap-8">
                    <UIcon name="tabler:list-details" class="w-10 h-10 text-gray-500 -mr-4" />
                    <SubHeading
                        :title="$t('data.designer.assetOfferingDetails')"
                        :info="$t('data.designer.assetOfferingDetailsInfo')"
                    />
                </div>
            </template>

            <div class="flex flex-col space-y-5 w-full">
                <UFormGroup
                    :label="$t('title')"
                    required
                    name="title"
                    :ui="{ error: 'absolute -bottom-6' }"
                    eager-validation
                >
                    <UInput
                        v-model="assetOfferingDetails.title"
                        :placeholder="$t('data.designer.titleOfAsset')"
                        :disabled="monetizationDetails.type === MonetizationType.NFT"
                    />
                </UFormGroup>
                <UFormGroup
                    :label="$t('description')"
                    required
                    name="description"
                    :ui="{ error: 'absolute -bottom-6' }"
                    eager-validation
                >
                    <UTextarea
                        v-model="assetOfferingDetails.description"
                        :placeholder="$t('data.designer.descriptionOfAsset')"
                        icon="i-heroicons-envelope"
                        :disabled="monetizationDetails.type === MonetizationType.NFT"
                    />
                </UFormGroup>
                <UFormGroup
                    v-if="monetizationDetails.type !== MonetizationType.NFT"
                    :label="$t('data.selectedDistribution')"
                    required
                    name="selectedDistribution"
                    :ui="{ error: 'absolute -bottom-6' }"
                    eager-validation
                >
                    <USelectMenu
                        v-model="assetOfferingDetails.selectedDistribution"
                        :options="assetOfferingDetails.distributions"
                    >
                    </USelectMenu>
                </UFormGroup>
                <UFormGroup
                    v-if="monetizationDetails.type !== MonetizationType.NFT"
                    :label="$t('keywords')"
                    required
                    name="keywords"
                    :ui="{ error: 'absolute -bottom-6' }"
                    eager-validation
                >
                    <!--Had to use separate event other than update:asset-offering-details as component would not cooperate -->
                    <vue3-tags-input
                        class="mb-3"
                        :tags="assetOfferingDetails.keywords"
                        :placeholder="assetOfferingDetails.keywords.length ? '' : $t('data.designer.keywordsOfAsset')"
                        @on-tags-changed="(value: string[]) => emit('update:asset-keywords', value)"
                    />
                </UFormGroup>
            </div>
        </UCard>
        <!-- <div class="w-full flex items-center justify-end gap-4">
            <UButton size="md" type="submit" @click="onSubmit">{{ $t('next') }} </UButton>
        </div> -->
    </UForm>
</template>

<style lang="css">
.v3ti .v3ti-tag {
    @apply bg-primary-500 h-[26px] align-middle;
}

.v3ti-new-tag {
    @apply text-sm text-gray-700 h-[30px] focus:ring-0 placeholder-gray-400 align-middle;
}

.v3ti .v3ti-tag .v3ti-remove-tag {
    @apply text-primary-100;
}

.v3ti {
    @apply border-none focus-within:border-none ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-primary-500 dark:focus-within:ring-primary-400 rounded-md h-[20px] align-middle;
}

.v3ti-content {
    focus: border-primary-500 align-baseline;
}
</style>
