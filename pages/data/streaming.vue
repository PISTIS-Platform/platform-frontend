<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();

const state = reactive({
    name: undefined,
    description: undefined,
});

const schema = z.object({
    name: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    description: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
});

const loaded = ref(false);

const onSubmit = (event: any) => {
    console.log(event);
};
</script>

<template>
    <UForm :schema="schema" :state="state" class="flex flex-col" @submit="onSubmit">
        <UCard class="w-full">
            <template #header>
                <SubHeading :title="$t('data.streaming.details')" :info="$t('data.streaming.detailsDesc')" />
            </template>

            <div class="flex flex-col gap-4">
                <UFormGroup :label="$t('data.streaming.name')" name="name">
                    <UInput v-model="state.name" :disabled="loaded" :ui="{ base: 'disabled:opacity-40' }" />
                </UFormGroup>
                <UFormGroup :label="$t('data.streaming.description')" name="description">
                    <UInput v-model="state.description" :disabled="loaded" :ui="{ base: 'disabled:opacity-40' }" />
                </UFormGroup>
            </div>
        </UCard>
    </UForm>
</template>
