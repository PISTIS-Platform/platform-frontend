<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();

const props = defineProps({
    assetOfferingDetails: {
        type: Object,
        required: true,
    },
    completeOrQuery: {
        type: String,
        required: true,
    },
});

const schema = z.object({
    title: z.string().min(10, t('val.atLeastNumberChars', { count: 10 })),
    description: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
});

const emit = defineEmits(['update:asset-title', 'update:asset-description', 'update:asset-keywords', 'isValid']);

const isValid = computed(() => {
    return schema.safeParse(props.assetOfferingDetails).success && props.assetOfferingDetails.keywords.length > 0;
});

watch(isValid, () => {
    emit('isValid', isValid.value);
});
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
        <UCard v-if="props.completeOrQuery" class="mt-8">
            <template #header>
                <SubHeading
                    :title="$t('data.designer.assetOfferingDetails')"
                    :info="$t('data.designer.assetOfferingDetailsInfo')"
                />
            </template>
            <UForm class="flex flex-col gap-4 w-full" :state="props.assetOfferingDetails" :schema="schema">
                <UFormGroup :label="$t('title')" required name="title">
                    <UInput
                        :model-value="props.assetOfferingDetails.title"
                        :placeholder="$t('data.designer.titleOfAsset')"
                        @update:model-value="(value: string) => emit('update:asset-title', value)"
                    />
                </UFormGroup>
                <UFormGroup :label="$t('description')" required name="description">
                    <UTextarea
                        :model-value="props.assetOfferingDetails.description"
                        :placeholder="$t('data.designer.descriptionOfAsset')"
                        icon="i-heroicons-envelope"
                        @update:model-value="(value: string) => emit('update:asset-description', value)"
                    />
                </UFormGroup>
                <UFormGroup :label="$t('keywords')" required>
                    <vue3-tags-input
                        :tags="props.assetOfferingDetails.keywords"
                        :placeholder="
                            props.assetOfferingDetails.keywords.length ? '' : $t('data.designer.keywordsOfAsset')
                        "
                        @on-tags-changed="(value: string[]) => emit('update:asset-keywords', value)"
                    />
                </UFormGroup>
            </UForm>
        </UCard>
    </Transition>
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
