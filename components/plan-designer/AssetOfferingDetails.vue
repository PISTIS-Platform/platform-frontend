<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();

const props = defineProps({
    assetDet: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['update:asset-det', 'update:asset-keywords', 'isValid']);

const schema = z.object({
    title: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    description: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
});

//use computed getter and setter to avoid prop mutation
const assetOfferingDetails = computed({
    get() {
        return props.assetDet;
    },
    set(newValue) {
        emit('update:asset-det', newValue);
    },
});

const isValid = computed(
    () => schema.safeParse(assetOfferingDetails.value).success && assetOfferingDetails.value.keywords.length > 0,
);

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
        <UCard>
            <template #header>
                <SubHeading
                    :title="$t('data.designer.assetOfferingDetails')"
                    :info="$t('data.designer.assetOfferingDetailsInfo')"
                />
            </template>
            <UForm class="flex flex-col space-y-5 w-full" :state="assetOfferingDetails" :schema="schema">
                <UFormGroup :label="$t('title')" required name="title">
                    <UInput v-model="assetOfferingDetails.title" :placeholder="$t('data.designer.titleOfAsset')" />
                </UFormGroup>
                <UFormGroup :label="$t('description')" required name="description">
                    <UTextarea
                        v-model="assetOfferingDetails.description"
                        :placeholder="$t('data.designer.descriptionOfAsset')"
                        icon="i-heroicons-envelope"
                    />
                </UFormGroup>
                <UFormGroup :label="$t('keywords')" required>
                    <!--Had to use separate event other than update:asset-offering-details as component would not cooperate -->
                    <vue3-tags-input
                        :tags="assetOfferingDetails.keywords"
                        :placeholder="assetOfferingDetails.keywords.length ? '' : $t('data.designer.keywordsOfAsset')"
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
