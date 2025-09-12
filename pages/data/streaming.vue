<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import { StreamingFormat, StreamingGranularity } from '~/constants/streaming';

const {
    public: { factoryUrl },
} = useRuntimeConfig();

const { t } = useI18n();
const { showErrorMessage } = useAlertMessage();

const streamingFormatChoices = [
    {
        label: 'CSV',
        value: StreamingFormat.CSV,
    },
    {
        label: 'JSON',
        value: StreamingFormat.JSON,
    },
    {
        label: t('data.streaming.plainText'),
        value: StreamingFormat.TEXT,
    },
];

const streamingGranularityChoices = [
    {
        label: t('data.streaming.granularity.realTime'),
        tooltip: t('data.streaming.granularityTooltip.realTime'),
        value: StreamingGranularity.REAL_TIME,
    },
    {
        label: t('data.streaming.granularity.frequent'),
        tooltip: t('data.streaming.granularityTooltip.frequent'),
        value: StreamingGranularity.FREQUENT,
    },
    {
        label: t('data.streaming.granularity.regular'),
        tooltip: t('data.streaming.granularityTooltip.regular'),
        value: StreamingGranularity.REGULAR,
    },
    {
        label: t('data.streaming.granularity.infrequent'),
        tooltip: t('data.streaming.granularityTooltip.infrequent'),
        value: StreamingGranularity.INFREQUENT,
    },
    {
        label: t('data.streaming.granularity.unspecified'),
        tooltip: t('data.streaming.granularityTooltip.unspecified'),
        value: StreamingGranularity.UNSPECIFIED,
    },
];

const selectedFormat = computed(() =>
    streamingFormatChoices.find((item: { label: string; value: string }) => item.value === state.format),
);

const selectedGranularity = computed(() =>
    streamingGranularityChoices.find(
        (item: { label: string; value: string; tooltip: string }) => item.value === state.granularity,
    ),
);

const state = reactive({
    title: undefined,
    description: undefined,
    format: streamingFormatChoices[0].value,
    granularity: streamingGranularityChoices[4].value,
});

const schema = z.object({
    title: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    description: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    format: z.string().min(1, t('required')),
    granularity: z.string().min(1, t('required')),
});

const loading = ref(false);
const loaded = ref(false);

const data = ref<Record<string, string | undefined>>({});

const onSubmit = async () => {
    loading.value = true;

    try {
        const details = await $fetch<{
            id: string;
            topic: string;
            kafkaUser: { name: string; secret: string };
            bootstrapServers: string;
            securityProtocol: string;
            saslMechanism: string;
        }>(`/api/connector/get-streaming-details`, {
            method: 'POST',
            body: {
                title: state.title,
                description: state.description,
            },
        });
        data.value.id = details.id;
        data.value.topic = details.topic;
        data.value.username = details.kafkaUser.name;
        data.value.password = details.kafkaUser.secret;
        data.value.title = state.title;
        data.value.description = state.description;
        data.value.brokerUrls = details.bootstrapServers;
        data.value.securityProtocol = details.securityProtocol;
        data.value.saslMechanism = details.saslMechanism;
        data.value.format = state.format;
        data.value.granularity = state.granularity;

        loaded.value = true;
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
    copy(data.value[key] || '');

    timeout = setTimeout(() => {
        keyBeingCopied.value = '';
    }, 2000);
};

const showPassword = ref(false);
</script>

<template>
    <UForm :schema="schema" :state="state" class="flex flex-col" @submit="onSubmit">
        <UCard
            :ui="{
                base: ['w-full flex flex-col transition-[flex-grow] duration-300 ease-in-out relative'],
            }"
        >
            <template #header>
                <SubHeading :title="$t('data.streaming.details')" :info="$t('data.streaming.detailsDesc')" />
            </template>

            <div v-if="!loaded" class="flex flex-col space-y-6 transition-all duration-300">
                <UFormGroup :label="$t('data.streaming.title')" name="title">
                    <UInput v-model="state.title" :disabled="loaded" :ui="{ base: 'disabled:opacity-40' }" />

                    <template #error="{ error }">
                        <div class="absolute left-0 -bottom-6">
                            {{ error }}
                        </div>
                    </template>
                </UFormGroup>
                <UFormGroup :label="$t('data.streaming.description')" name="description">
                    <UTextarea v-model="state.description" :disabled="loaded" :ui="{ base: 'disabled:opacity-40' }" />
                    <template #error="{ error }">
                        <div class="absolute left-0 -bottom-6">
                            {{ error }}
                        </div>
                    </template>
                </UFormGroup>
                <UFormGroup :label="$t('data.streaming.format')" name="format">
                    <div class="flex items-center gap-2">
                        <URadio
                            v-for="choice in streamingFormatChoices"
                            :key="choice.value"
                            v-model="state.format"
                            v-bind="choice"
                        />
                    </div>
                    <template #error="{ error }">
                        <div class="absolute left-0 -bottom-6">
                            {{ error }}
                        </div>
                    </template>
                </UFormGroup>
                <UFormGroup :label="$t('data.streaming.granularity.title')" name="granularity">
                    <div class="flex items-center gap-2">
                        <UTooltip
                            v-for="choice in streamingGranularityChoices"
                            :key="choice.value"
                            :text="choice.tooltip"
                            :ui="{ width: 'max-w-2xl', base: 'text-wrap' }"
                        >
                            <URadio v-model="state.granularity" v-bind="choice" />
                        </UTooltip>
                    </div>
                    <template #error="{ error }">
                        <div class="absolute left-0 -bottom-6">
                            {{ error }}
                        </div>
                    </template>
                </UFormGroup>
            </div>
            <div v-else class="w-full flex flex-col text-sm gap-6 text-gray-700">
                <UCard :ui="{ background: 'bg-gray-50' }">
                    <template #header>
                        <span class="font-semibold">{{ $t('data.streaming.datasetDetails') }}</span>
                    </template>
                    <div class="flex flex-col gap-4">
                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.titlePlain') }}:
                            <span class="font-normal font-mono">{{ data.title }}</span>
                        </span>

                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.descriptionPlain') }}:
                            <span class="font-normal font-mono">{{ data.description }}</span>
                        </span>
                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.format') }}:
                            <span class="font-normal font-mono">{{ selectedFormat?.label }}</span>
                        </span>
                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.granularity.title') }}:
                            <span class="font-normal font-mono"
                                >{{ selectedGranularity?.label }} ({{ selectedGranularity?.tooltip }})</span
                            >
                        </span>
                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.catalogLink') }}:
                            <span class="font-normal font-mono"
                                ><NuxtLink
                                    class="text-primary-500"
                                    :to="`${factoryUrl}/catalog/dataset-details/${data.id}?pm=factory&locale=en`"
                                    target="_blank"
                                    >{{
                                        `${factoryUrl}/catalog/dataset-details/${data.id}?pm=factory&locale=en`
                                    }}</NuxtLink
                                ></span
                            >
                        </span>
                    </div>
                </UCard>

                <UCard :ui="{ background: 'bg-gray-50' }">
                    <template #header>
                        <span class="font-semibold">{{ $t('data.streaming.streamingDetails') }}</span>
                    </template>
                    <UAlert
                        icon="i-heroicons-command-line"
                        color="yellow"
                        variant="subtle"
                        :title="$t('data.streaming.warning')"
                        :description="$t('data.streaming.pleaseSave')"
                        class="mb-6"
                    />

                    <div class="flex flex-col gap-4">
                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.topic') }}:
                            <span class="font-normal font-mono">{{ data.topic }}</span>
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem('topic')"
                                >{{ copied && keyBeingCopied === 'topic' ? 'Copied' : '' }}</UButton
                            ></span
                        >

                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.username') }}:
                            <span class="font-normal font-mono">{{ data.username }}</span>
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem('username')"
                                >{{ copied && keyBeingCopied === 'username' ? 'Copied' : '' }}</UButton
                            ></span
                        >

                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.password') }}:
                            <span class="font-normal font-mono">{{ showPassword ? data.password : '*********' }}</span>
                            <UButton size="xs" @click="showPassword = !showPassword">
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

                        <div class="flex items-start gap-2 font-bold">
                            <span class="mt-[5px] font-bold">{{ $t('data.streaming.brokerUrl') }}:</span>
                            <div class="flex flex-col gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="font-normal font-mono">{{ data.brokerUrls }}</span>
                                    <UButton
                                        icon="i-heroicons-document-duplicate"
                                        size="sm"
                                        variant="ghost"
                                        square
                                        @click="copyItem('brokerUrls')"
                                        >{{ copied && keyBeingCopied === 'brokerUrls' ? 'Copied' : '' }}</UButton
                                    >
                                </div>
                            </div>
                        </div>

                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.securityProtocol') }}:
                            <span class="font-normal font-mono">{{ data.securityProtocol }}</span>
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem('securityProtocol')"
                                >{{ copied && keyBeingCopied === 'securityProtocol' ? 'Copied' : '' }}</UButton
                            ></span
                        >

                        <span class="flex items-center gap-2 font-bold"
                            >{{ $t('data.streaming.saslMechanism') }}:
                            <span class="font-normal font-mono">{{ data.saslMechanism }}</span>
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
            <div class="flex items-center justify-end w-full mt-6">
                <UButton v-if="!loaded" size="lg" type="submit" :ui="{ base: 'w-24 flex items-center justify-center' }"
                    ><UIcon v-if="loading" name="eos-icons:loading" class="w-5 h-5" /><span v-else
                        >Create</span
                    ></UButton
                >
            </div>
        </UCard>
    </UForm>
</template>
