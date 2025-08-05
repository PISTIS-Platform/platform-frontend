<script setup lang="ts">
const { data: accountData, status: accountStatus } = await useFetch<Record<string, any>>(
    `/api/account/get-account-details`,
    {
        query: { page: 'profile' },
    },
);

const { data: streamingConsumerData, status: streamingConsumerStatus } = useFetch<{
    username: string;
    password: string;
    bootstrapServers: string;
    securityProtocol: string;
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

const noKafkaData = computed(() => {
    if (!streamingConsumerData.value) {
        return true;
    }
    Object.keys(streamingConsumerData).forEach((key: string) => {
        if (!streamingConsumerData.value[key]) return true;
    });

    return false;
});
</script>

<template>
    <PageContainer>
        <div class="w-full mt-4">
            <UProgress
                v-if="accountStatus === 'pending' || streamingConsumerStatus === 'pending'"
                animation="carousel"
            />
            <div v-else>
                <div v-if="accountData" class="flex flex-wrap sm:flex-nowrap gap-8">
                    <UCard class="w-full sm:w-1/2 flex flex-col">
                        <template #header>
                            <SubHeading :title="$t('account.userDetails')" :info="$t('account.info')" />
                        </template>
                        <div class="w-full flex flex-col gap-6">
                            <div class="flex flex-col gap-2">
                                <span class="font-semibold text-gray-400 text-sm">{{ $t('account.user.name') }}</span>
                                <span>{{ accountData.user.name }}</span>
                            </div>
                            <div class="flex flex-col gap-2">
                                <span class="font-semibold text-gray-400 text-sm">{{ $t('account.user.email') }}</span>
                                <span class="flex items-center gap-2"
                                    >{{ accountData.user.email }}
                                    <UBadge
                                        v-if="accountData.user.roles.includes('PISTIS_ADMIN')"
                                        icon="mid:administrator"
                                        size="sm"
                                        color="white"
                                        variant="solid"
                                        :label="$t('administrator')"
                                        :trailing="false"
                                        class="flex gap-2 items-center"
                                    >
                                        <UIcon name="mdi:administrator" class="w-4 h-4" /><span>{{
                                            $t('administrator')
                                        }}</span>
                                    </UBadge>
                                </span>
                            </div>
                            <!-- TODO: Add badge if user is creator of org (when/if info is available)-->
                        </div>
                    </UCard>
                    <UCard class="w-full sm:w-1/2 flex flex-col">
                        <template #header>
                            <SubHeading :title="$t('account.orgDetails')" :info="$t('account.orgDetailsInfo')" />
                        </template>
                        <div class="w-full flex gap-8 justify-between">
                            <div class="flex flex-col gap-6">
                                <div class="flex flex-col gap-2">
                                    <span class="font-semibold text-gray-400 text-sm">{{
                                        $t('account.org.name')
                                    }}</span>
                                    <pre>{{ accountData.org.name }}</pre>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <span class="font-semibold text-gray-400 text-sm">{{
                                        $t('account.org.country')
                                    }}</span>
                                    <span>{{ $t(`countries.${accountData.org.country}`) }}</span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-6">
                                <div class="flex flex-col gap-2">
                                    <span class="font-semibold text-gray-400 text-sm">{{
                                        $t('account.org.size')
                                    }}</span>
                                    <span>{{ $t(`companySizes.${accountData.org.size}`) }}</span>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <span class="font-semibold text-gray-400 text-sm">{{
                                        $t('account.org.domain')
                                    }}</span>
                                    <span>{{ $t(`companyDomains.${accountData.org.domain}`) }}</span>
                                </div>
                            </div>

                            <div class="flex flex-col gap-2">
                                <span class="font-semibold text-gray-400 text-sm">{{ $t('account.org.type') }}</span>
                                <span>{{ $t(`companyTypes.${accountData.org.type}`) }}</span>
                            </div>
                        </div>
                    </UCard>
                </div>
                <UAlert
                    v-else
                    icon="mingcute:alert-line"
                    color="red"
                    variant="subtle"
                    :description="$t('account.noDetailsFound')"
                    class="w-full max-w-xl"
                />

                <div v-if="streamingConsumerData" class="flex flex-wrap sm:flex-nowrap gap-8 mt-6 w-full">
                    <UCard class="w-full sm:w-1/2 mb-6">
                        <template #header>
                            <SubHeading
                                :title="$t('settings.streamingSettings')"
                                :info="$t('settings.streamingInfo')"
                            />
                        </template>
                        <div v-if="!noKafkaData" class="flex flex-col">
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
                                    >
                                </span>
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
                                    >
                                </span>
                            </div>
                            <div class="flex flex-col gap-2 mt-6">
                                <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                                    <span class="font-semibold text-gray-500">{{
                                        $t('settings.bootstrapServers')
                                    }}</span>
                                </div>
                                <span
                                    v-for="url in streamingConsumerData?.bootstrapServers?.split(',')"
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
                                    >
                                </span>
                            </div>
                            <div class="flex flex-col gap-2 mt-6">
                                <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                                    <span class="font-semibold text-gray-500">{{
                                        $t('settings.securityProtocol')
                                    }}</span>
                                </div>
                                <span class="font-mono flex items-center"
                                    >{{ streamingConsumerData.securityProtocol }}
                                    <UButton
                                        icon="i-heroicons-document-duplicate"
                                        size="sm"
                                        variant="ghost"
                                        square
                                        @click="copyItem(streamingConsumerData.securityProtocol, 'securityProtocol')"
                                        >{{ copied && keyBeingCopied === 'securityProtocol' ? 'Copied' : '' }}</UButton
                                    >
                                </span>
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
                                    >
                                </span>
                            </div>
                        </div>
                    </UCard>
                    <div class="w-0 sm:w-1/2"></div>
                </div>
                <UAlert
                    v-else
                    icon="mingcute:alert-line"
                    color="red"
                    variant="subtle"
                    :description="$t('settings.noStreamingDataFound')"
                    class="w-full max-w-xl mt-6"
                />
            </div>
        </div>
    </PageContainer>
</template>
