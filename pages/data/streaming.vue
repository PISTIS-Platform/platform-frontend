<script setup lang="ts">
import { v4 as uuid } from 'uuid';
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
const id = ref<string | null>(null);

const data = ref<Record<string, string | undefined>>({});

const onSubmit = async () => {
    loading.value = true;
    id.value = uuid();

    try {
        const details = await $fetch<{ topic: string; kafkaUser: { name: string; secret: string } }>(
            `/api/connector/get-streaming-details`,
            {
                method: 'POST',
                body: {
                    id: id.value,
                },
            },
        );
        data.value.id = id.value;
        data.value.topic = details.topic;
        data.value.username = details.kafkaUser.name;
        data.value.password = details.kafkaUser.secret;
        data.value.name = state.name;
        data.value.description = state.description;
        console.log({ details });

        const publish = await $fetch<any>(`/api/connector/streaming-to-catalog`, {
            method: 'POST',
            body: {
                id: id.value,
                title: state.name,
                description: state.description,
            },
        });
        console.log({ publish });
    } catch (err: any) {
        //TODO: Display error
    } finally {
        loaded.value = true;
        loading.value = false;
        setTimeout(() => {
            showBox.value = true;
        }, 300);
    }
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
                    type="submit"
                    :ui="{ base: 'absolute bottom-6 right-6 w-24 flex items-center justify-center' }"
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
                    <div v-for="key in Object.keys(data)" :key="key" class="flex items-center justify-start gap-4">
                        <span class="text-base font-semibold font-mono">{{ key }}:</span>
                        <span class="font-mono">{{ data[key] }}</span>
                    </div>
                </div>
            </transition>
        </UCard>
    </UForm>
</template>
