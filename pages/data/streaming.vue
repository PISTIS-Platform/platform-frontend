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

const loading = ref(false);
const loaded = ref(false);
const showBox = ref(false);

const dummyData = reactive({
    topic: 'Topic #234897',
    username: 'Kafka-User-234987',
    password: '$&DgoP*svcVfwcSw3*Pw',
    assetId: '3000092b-b1af-41dd-b0da-cfeb72325c79',
    name: undefined,
    description: undefined,
});

const onSubmit = (event: unknown) => {
    loading.value = true;
    // if (schema.safeParse(state).success) {
    //     loaded.value = true;
    // }
    dummyData.name = state.name;
    dummyData.description = state.description;

    setTimeout(() => {
        loaded.value = true;
        loading.value = false;
    }, 3000);
    setTimeout(() => {
        showBox.value = true;
    }, 3300);
    console.log(event);
};
</script>

<template>
    <UForm :schema="schema" :state="state" class="flex flex-col flex-1" @submit="onSubmit">
        <UCard
            :ui="{
                base: [
                    'w-full flex flex-col transition-[flex-grow] duration-300 ease-in-out relative',
                    loaded ? 'flex-1 h-full' : 'flex-none',
                ],
            }"
        >
            <template #header>
                <SubHeading :title="$t('data.streaming.details')" :info="$t('data.streaming.detailsDesc')" />
            </template>

            <div class="flex flex-col space-y-6 transition-all duration-300 flex-1" :class="loaded ? 'pb-8' : 'pb-16'">
                <UFormGroup :label="$t('data.streaming.name')" name="name">
                    <UInput v-model="state.name" :disabled="loaded" :ui="{ base: 'disabled:opacity-40' }" />

                    <template #error="{ error }">
                        <div class="absolute left-0 -bottom-6">
                            {{ error }}
                        </div>
                    </template>
                </UFormGroup>
                <UFormGroup :label="$t('data.streaming.description')" name="description">
                    <UInput v-model="state.description" :disabled="loaded" :ui="{ base: 'disabled:opacity-40' }" />
                    <template #error="{ error }">
                        <div class="absolute left-0 -bottom-6">
                            {{ error }}
                        </div>
                    </template>
                </UFormGroup>
                <UButton
                    size="lg"
                    :ui="{ base: 'absolute bottom-6 right-6 w-24 flex items-center justify-center' }"
                    @click="onSubmit"
                    ><UIcon v-if="loading" name="eos-icons:loading" class="w-5 h-5" /><span v-else
                        >Submit</span
                    ></UButton
                >
            </div>
            <transition
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                enter-active-class="transition-opacity duration-300 delay-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
                leave-active-class="transition-opacity duration-300"
            >
                <div
                    v-show="showBox"
                    class="w-full border bg-gray-100 flex flex-col rounded-lg p-6 text-sm overflow-y-scroll gap-6"
                >
                    <div v-for="key in Object.keys(dummyData)" :key="key" class="flex items-center justify-start gap-4">
                        <span class="text-base font-semibold font-mono">{{ key }}:</span>
                        <span class="font-mono">{{ dummyData[key] }}</span>
                    </div>
                </div>
            </transition>
        </UCard>
    </UForm>
</template>
