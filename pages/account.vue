<script setup lang="ts">
const { data: accountData, status: accountStatus } = useFetch<Record<string, any>>(`/api/account/get-account-details`);
</script>

<template>
    <PageContainer>
        <div class="w-full mt-4">
            <UProgress v-if="accountStatus === 'pending'" animation="carousel" />
            <UCard v-else>
                <template #header>
                    <SubHeading :title="$t('settings.title')" :info="$t('settings.info')" />
                </template>
                <div v-if="accountData" class="w-full flex flex-col gap-6">
                    <div class="flex flex-col gap-2">
                        <span class="font-semibold text-gray-500">{{ $t('settings.factoryUrl') }}</span>
                        <pre>{{ `https://${accountData.factoryPrefix}.pistis-market.eu` }}</pre>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="font-semibold text-gray-500">{{ $t('settings.authorizationStatus') }}</span>
                        <span class="flex items-center gap-2">
                            <span v-if="accountData.isAccepted">{{ $t('settings.accepted') }}</span>
                            <span v-else>{{ $t('settings.notAccepted') }}</span>
                            <div
                                v-if="accountData.isAccepted"
                                class="border w-3 h-3 rounded-full bg-green-300 border-green-500 mt-0.5"
                            ></div>
                            <div v-else class="border w-3 h-3 rounded-full bg-red-300 border-red-500 mt-0.5"></div>
                        </span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="font-semibold text-gray-500">{{ $t('settings.organizationName') }}</span>
                        <span>{{ accountData.organizationName }}</span>
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
        </div>
    </PageContainer>
</template>
