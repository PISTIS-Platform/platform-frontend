<script setup lang="ts">
const { data: factorySettingsData, status: factorySettingsStatus } = useFetch<Record<string, any>>(
    `/api/settings/get-factory-settings`,
);

//TODO: Get from API, set loading status in template
const streamingConsumerData = ref({
    username: 'user-234987',
    password: '123fdkfje4287dlfkj',
});

const revealPassword = ref(false);
</script>

<template>
    <PageContainer>
        <div class="w-full mt-4">
            <UProgress v-if="factorySettingsStatus === 'pending'" animation="carousel" />
            <div v-else class="flex flex-col gap-6">
                <UCard>
                    <template #header>
                        <SubHeading :title="$t('settings.title')" :info="$t('settings.info')" />
                    </template>
                    <div v-if="factorySettingsData" class="w-full flex flex-col gap-6">
                        <div class="flex flex-col gap-2">
                            <span class="font-semibold text-gray-500">{{ $t('settings.factoryUrl') }}</span>
                            <pre>{{ `https://${factorySettingsData.factoryPrefix}.pistis-market.eu` }}</pre>
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

                <UCard>
                    <template #header>
                        <SubHeading :title="$t('settings.streamingSettings')" :info="$t('settings.streamingInfo')" />
                    </template>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{
                                $t('settings.streamingConsumerUsername')
                            }}</span>
                        </div>
                        <span class="font-mono">{{ streamingConsumerData.username }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
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
                        <span class="font-mono">{{
                            revealPassword ? streamingConsumerData.password : '*********'
                        }}</span>
                    </div>
                </UCard>
            </div>
        </div>
    </PageContainer>
</template>
