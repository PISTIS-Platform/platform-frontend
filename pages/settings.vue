<script setup lang="ts">
const { data: factorySettingsData, status: factorySettingsStatus } = useFetch<Record<string, any>>(
    `/api/settings/get-factory-settings`,
);

const { data: streamingConsumerData, status: streamingConsumerStatus } = useFetch<{
    username: string;
    password: string;
    brokerUrl: string;
    mechanismProtocol: string;
    saslMechanism: string;
}>(`/api/account/get-kafka-details`);

const revealPassword = ref(false);

let timeout: ReturnType<typeof setTimeout>;
const { copy, copied } = useClipboard();
const keyBeingCopied = ref('');

const copyItem = (data: string, key: string) => {
    clearTimeout(timeout);
    keyBeingCopied.value = key;
    copy(data);
    timeout = setTimeout(() => {
        keyBeingCopied.value = '';
    }, 2000);
};
</script>

<template>
    <PageContainer>
        <div class="w-full mt-4">
            <UProgress
                v-if="factorySettingsStatus === 'pending' || streamingConsumerStatus === 'pending'"
                animation="carousel"
            />
            <div v-else class="flex flex-col gap-6">
                <UCard>
                    <template #header>
                        <SubHeading :title="$t('settings.title')" :info="$t('settings.info')" />
                    </template>
                    <div v-if="factorySettingsData" class="w-full flex flex-col gap-6">
                        <div class="flex flex-col gap-2">
                            <span class="font-semibold text-gray-500">{{ $t('settings.factoryUrl') }}</span>
                            <div class="flex items-center">
                                <pre>{{ `https://${factorySettingsData.factoryPrefix}.pistis-market.eu` }}</pre>
                                <UButton
                                    icon="i-heroicons-document-duplicate"
                                    size="sm"
                                    variant="ghost"
                                    square
                                    @click="
                                        copyItem(
                                            `https://${factorySettingsData.factoryPrefix}.pistis-market.eu`,
                                            'factoryURL',
                                        )
                                    "
                                    >{{ copied && keyBeingCopied === 'factoryURL' ? 'Copied' : '' }}</UButton
                                >
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="font-semibold text-gray-500">{{ $t('settings.authorizationStatus') }}</span>
                            <span class="flex items-center gap-2">
                                <span v-if="factorySettingsData.isAccepted">{{
                                    $t('settings.factory') + ' ' + $t('settings.accepted')
                                }}</span>
                                <span v-else>{{ $t('settings.factory') + ' ' + $t('settings.notAccepted') }}</span>
                                <div
                                    v-if="factorySettingsData.isAccepted"
                                    class="border w-3 h-3 rounded-full bg-green-300 border-green-500 mt-0.5"
                                ></div>
                                <div v-else class="border w-3 h-3 rounded-full bg-red-300 border-red-500 mt-0.5"></div>
                            </span>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="font-semibold text-gray-500">{{ $t('settings.organizationName') }}</span>
                            <span>{{ factorySettingsData.organizationName }}</span>
                        </div>
                    </div>
                    <UAlert
                        v-else
                        icon="mingcute:alert-line"
                        color="red"
                        variant="subtle"
                        :description="$t('settings.noFactoryFound')"
                        class="w-full max-w-xl"
                    />
                </UCard>

                <UCard v-if="streamingConsumerData">
                    <template #header>
                        <SubHeading :title="$t('settings.streamingSettings')" :info="$t('settings.streamingInfo')" />
                    </template>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{
                                $t('settings.streamingConsumerUsername')
                            }}</span>
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ streamingConsumerData.username }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem(streamingConsumerData.username, 'consumerUsername')"
                                >{{ copied && keyBeingCopied === 'consumerUsername' ? 'Copied' : '' }}</UButton
                            ></span
                        >
                    </div>
                    <div class="flex flex-col gap-2 mt-6">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{
                                $t('settings.streamingConsumerPassword')
                            }}</span>
                            <UButton
                                class="flex items-center justify-center w-16"
                                size="xs"
                                @click="revealPassword = !revealPassword"
                                >{{ revealPassword ? 'Hide' : 'Reveal' }}</UButton
                            >
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ revealPassword ? streamingConsumerData.password : '*********' }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem(streamingConsumerData.password, 'consumerPassword')"
                                >{{ copied && keyBeingCopied === 'consumerPassword' ? 'Copied' : '' }}</UButton
                            ></span
                        >
                    </div>
                    <div class="flex flex-col gap-2 mt-6">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{ $t('settings.brokerUrl') }}</span>
                        </div>
                        <span
                            v-for="url in streamingConsumerData.brokerUrl.split(',')"
                            :key="url"
                            class="font-mono flex items-center"
                            >{{ url }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem(url, url)"
                                >{{ copied && keyBeingCopied === url ? 'Copied' : '' }}</UButton
                            ></span
                        >
                    </div>
                    <div class="flex flex-col gap-2 mt-6">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{ $t('settings.mechanismProtocol') }}</span>
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ streamingConsumerData.mechanismProtocol }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem(streamingConsumerData.mechanismProtocol, 'mechanismProtocol')"
                                >{{ copied && keyBeingCopied === 'mechanismProtocol' ? 'Copied' : '' }}</UButton
                            ></span
                        >
                    </div>
                    <div class="flex flex-col gap-2 mt-6">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{ $t('settings.saslMechanism') }}</span>
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ streamingConsumerData.saslMechanism }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem(streamingConsumerData.saslMechanism, 'saslMechanism')"
                                >{{ copied && keyBeingCopied === 'saslMechanism' ? 'Copied' : '' }}</UButton
                            ></span
                        >
                    </div>
                </UCard>
            </div>
        </div>
    </PageContainer>
</template>
