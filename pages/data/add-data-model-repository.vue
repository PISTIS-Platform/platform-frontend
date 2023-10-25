<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui/dist/runtime/types';
import { ref } from 'vue';

const state = ref({
    title: undefined,
    version: undefined,
    description: undefined,
    data: undefined,
});

const validate = (state: any): FormError[] => {
    const errors = [];
    if (!state.title) errors.push({ path: 'title', message: 'Required' });
    return errors;
};

async function submit(event: FormSubmitEvent<any>) {
    // Do something with data
    console.log(event.data);
}
</script>

<template>
    <div class="w-full h-full text-gray-700">
        <Heading :title="$t('data.dmRepository.dmAddTitle')" />

        <div class="mt-8">
            <UForm
                :validate="validate"
                :state="state"
                class="flex flex-col justify-center items-center"
                @submit="submit"
            >
                <UFormGroup class="mt-3" label="Title" name="title">
                    <UInput v-model="state.title" />
                </UFormGroup>
                <UFormGroup class="mt-3" label="Version" name="version">
                    <UInput v-model="state.version" />
                </UFormGroup>
                <UFormGroup class="mt-3" label="Description" name="description">
                    <UTextarea v-model="state.description" />
                </UFormGroup>
                <UButton class="mt-3" type="submit"> Submit </UButton>
            </UForm>
        </div>
    </div>
</template>
