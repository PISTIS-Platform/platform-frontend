<script setup lang="ts">
import { z } from 'zod';

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
    title: z.string().min(10, 'Must be at least 10 characters'),
    description: z.string().min(20, 'Must be at least 20 characters'),
    keywords: z.string(),
});

const emit = defineEmits(['reset', 'update:title', 'update:description', 'update:keywords']);
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
                <SubHeading title="Asset Offering Details" info="Find out more here" />
            </template>
            <UForm class="flex flex-col gap-4 w-full" :state="props.assetOfferingDetails" :schema="schema">
                <UFormGroup label="Title" required name="title">
                    <UInput
                        :model-value="props.assetOfferingDetails.title"
                        placeholder="Title of the asset"
                        @update:model-value="(value: string) => emit('update:title', value)"
                    />
                </UFormGroup>
                <UFormGroup label="Description" required name="description">
                    <UTextarea
                        :model-value="props.assetOfferingDetails.description"
                        placeholder="Type a description for the asset here"
                        icon="i-heroicons-envelope"
                        @update:model-value="(value: string) => emit('update:description', value)"
                    />
                </UFormGroup>
                <UFormGroup label="Keywords" required name="keywords">
                    <!-- <UInput
                        :model-value.trim="props.assetOfferingDetails.keywords"
                        placeholder="Type keywords separated by commas"
                        @update:model-value="(value: string[]) => emit('update:keywords', value)"
                    /> -->
                    <vue3-tags-input
                        :tags="props.assetOfferingDetails.keywords"
                        :placeholder="
                            props.assetOfferingDetails.keywords.length ? '' : 'Type keywords separated by commas'
                        "
                        @on-tags-changed="(value: string[]) => emit('update:keywords', value)"
                    />
                </UFormGroup>
            </UForm>
        </UCard>
    </Transition>
</template>

<style lang="css">
.v3ti .v3ti-tag {
    @apply bg-primary-500 h-[24px];
}

.v3ti-new-tag {
    @apply text-sm text-gray-700 h-[30px] focus:ring-0 placeholder-gray-400 pb-2;
}

.v3ti .v3ti-tag .v3ti-remove-tag {
    @apply text-white;
}

.v3ti {
    @apply border border-gray-300 rounded-md h-[20px];
}

.v3ti-content {
    focus: border-primary-500;
}
</style>
