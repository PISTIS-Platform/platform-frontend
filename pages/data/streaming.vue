<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const {
    public: { factoryUrl, kafkaSaslMechanism, kafkaSecurityProtocol },
} = useRuntimeConfig();

const { t } = useI18n();
const { showErrorMessage } = useAlertMessage();

const state = reactive({
    title: undefined,
    description: undefined,
});

const schema = z.object({
    title: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    description: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
});

const loading = ref(false);
const loaded = ref(false);
const showBox = ref(false);

const data = ref<Record<string, string | undefined>>({});

data.value.brokerUrl = `kafka.${factoryUrl.split('https://')[1]}:9094`;
data.value.securityProtocol = kafkaSecurityProtocol;
data.value.saslMechanism = kafkaSaslMechanism;

const onSubmit = async () => {
    loading.value = true;

    try {
        const details = await $fetch<{ topic: string; kafkaUser: { name: string; secret: string } }>(
            `/api/connector/get-streaming-details`,
            {
                method: 'POST',
                body: {
                    title: state.title,
                    description: state.description,
                },
            },
        );
        data.value.topic = details.topic;
        data.value.username = details.kafkaUser.name;
        data.value.password = details.kafkaUser.secret;
        data.value.title = state.title;
        data.value.description = state.description;

        loaded.value = true;
        setTimeout(() => {
            showBox.value = true;
        }, 300);
    } catch (err: any) {
        showErrorMessage(`Error: ${err.status}: ${err.message}`);
    } finally {
        loading.value = false;
    }
};
let timeout: ReturnType<typeof setTimeout>;
const { copy, copied } = useClipboard();
const keyBeingCopied = ref('');

const copyItem = (key: string) => {
    clearTimeout(timeout);
    keyBeingCopied.value = key;
    copy(data.value[key]);
    timeout = setTimeout(() => {
        keyBeingCopied.value = '';
    }, 2000);
};

const showPassword = ref(false);

const clearForm = () => {
    loaded.value = false;
    showBox.value = false;
    data.value = {};
    state.title = undefined;
    state.description = undefined;
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

            <div class="flex flex-col space-y-6 transition-all duration-300 flex-1">
                <UFormGroup :label="$t('data.streaming.title')" name="title">
                    <UInput v-model="state.title" :disabled="loaded" :ui="{ base: 'disabled:opacity-40' }" />

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
            </div>
            <transition
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                enter-active-class="transition-opacity duration-300 delay-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
                leave-active-class="transition-opacity duration-300"
            >
                <div v-show="showBox" class="w-full flex flex-col text-sm gap-6 text-gray-700">
                    <UCard :ui="{ background: 'bg-gray-50' }">
                        <template #header>
                            <span class="font-semibold">{{ $t('data.streaming.datasetDetails') }}</span>
                        </template>
                        <!-- //FIXME: Fix for actual data -->
                        <div class="flex flex-col gap-4">
                            <span class="flex font-mono items-center gap-2 font-bold"
                                >{{ $t('data.streaming.datasetId') }}:
                                <span class="font-normal">{{ data.id }}</span>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="copyItem('id')"
                                    >{{ copied && keyBeingCopied === 'id' ? 'Copied' : '' }}</UButton
                                ></span
                            >

                            <span class="flex font-mono items-center gap-2 font-bold"
                                >{{ $t('data.streaming.title') }}:
                                <span class="font-normal">{{ data.title }}</span>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="copyItem('title')"
                                    >{{ copied && keyBeingCopied === 'title' ? 'Copied' : '' }}</UButton
                                ></span
                            >

                            <span class="flex font-mono items-center gap-2 font-bold"
                                >{{ $t('data.streaming.description') }}:
                                <span class="font-normal">{{ data.description }}</span>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="copyItem('description')"
                                    >{{ copied && keyBeingCopied === 'description' ? 'Copied' : '' }}</UButton
                                ></span
                            >
                        </div>
                    </UCard>

                    <UCard :ui="{ background: 'bg-gray-50' }">
                        <template #header>
                            <span class="font-semibold">{{ $t('data.streaming.streamingDetails') }}</span>
                        </template>
                        <div class="flex flex-col gap-4">
                            <span class="flex font-mono items-center gap-2 font-bold"
                                >{{ $t('data.streaming.topic') }}:
                                <span class="font-normal">{{ data.topic }}</span>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="copyItem('topic')"
                                    >{{ copied && keyBeingCopied === 'topic' ? 'Copied' : '' }}</UButton
                                ></span
                            >

                            <span class="flex font-mono items-center gap-2 font-bold"
                                >{{ $t('data.streaming.username') }}:
                                <span class="font-normal">{{ data.username }}</span>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="copyItem('username')"
                                    >{{ copied && keyBeingCopied === 'username' ? 'Copied' : '' }}</UButton
                                ></span
                            >

                            <span class="flex font-mono items-center gap-2 font-bold"
                                >{{ $t('data.streaming.password') }}:
                                <span class="font-normal">{{ showPassword ? data.password : '*********' }}</span>
                                <UButton size="xs">
                                    {{ showPassword ? 'Hide' : 'Reveal' }}
                                </UButton>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="copyItem('password')"
                                    >{{ copied && keyBeingCopied === 'password' ? 'Copied' : '' }}</UButton
                                ></span
                            >

                            <span class="flex font-mono items-center gap-2 font-bold"
                                >{{ $t('data.streaming.brokerUrl') }}:
                                <span class="font-normal">{{ data.brokerUrl }}</span>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="copyItem('brokerUrl')"
                                    >{{ copied && keyBeingCopied === 'brokerUrl' ? 'Copied' : '' }}</UButton
                                ></span
                            >

                            <span class="flex font-mono items-center gap-2 font-bold"
                                >{{ $t('data.streaming.securityProtocol') }}:
                                <span class="font-normal">{{ data.securityProtocol }}</span>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="copyItem('securityProtocol')"
                                    >{{ copied && keyBeingCopied === 'securityProtocol' ? 'Copied' : '' }}</UButton
                                ></span
                            >

                            <span class="flex font-mono items-center gap-2 font-bold"
                                >{{ $t('data.streaming.saslMechanism') }}:
                                <span class="font-normal">{{ data.saslMechanism }}</span>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="copyItem('saslMechanism')"
                                    >{{ copied && keyBeingCopied === 'saslMechanism' ? 'Copied' : '' }}</UButton
                                ></span
                            >
                        </div>
                    </UCard>
                </div>
            </transition>
            <div class="flex items-center justify-end w-full mt-6">
                <UButton v-if="!loaded" size="lg" type="submit" :ui="{ base: 'w-24 flex items-center justify-center' }"
                    ><UIcon v-if="loading" name="eos-icons:loading" class="w-5 h-5" /><span v-else
                        >Create</span
                    ></UButton
                >
                <UButton
                    v-if="loaded"
                    size="lg"
                    color="white"
                    :ui="{ base: 'w-24 flex items-center justify-center' }"
                    @click="clearForm"
                    >Clear</UButton
                >
            </div>
        </UCard>
    </UForm>
</template>
