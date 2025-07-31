<script setup lang="ts">
const { data: accountData, status: accountStatus } = useFetch<Record<string, any>>(`/api/account/get-account-details`);
</script>

<template>
    <PageContainer>
        <div class="w-full mt-4">
            <UProgress v-if="accountStatus === 'pending'" animation="carousel" />
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
                                        ><UIcon name="mdi:administrator" class="w-4 h-4" /><span>{{
                                            $t('administrator')
                                        }}</span></UBadge
                                    >
                                </span>
                            </div>
                            <!-- TODO: Add badge if user is creator of org (when/if info is available)-->
                        </div>
                    </UCard>
                    <UCard class="w-full sm:w-1/2 flex flex-col">
                        <template #header>
                            <SubHeading :title="$t('account.orgDetails')" :info="$t('account.orgDetailsInfo')" />
                        </template>
                        <div class="w-full flex flex-col gap-6">
                            <div class="flex flex-col gap-2">
                                <span class="font-semibold text-gray-400 text-sm">{{ $t('account.org.name') }}</span>
                                <pre>{{ accountData.org.name.replace(/^\//, '') }}</pre>
                            </div>
                            <div class="flex flex-col gap-2">
                                <span class="font-semibold text-gray-400 text-sm">{{ $t('account.org.country') }}</span>
                                <span>{{ $t(`countries.${accountData.org.country}`) }}</span>
                            </div>
                            <div class="flex flex-col gap-2">
                                <span class="font-semibold text-gray-400 text-sm">{{ $t('account.org.size') }}</span>
                                <span>{{ $t(`companySizes.${accountData.org.size}`) }}</span>
                            </div>
                            <div class="flex flex-col gap-2">
                                <span class="font-semibold text-gray-400 text-sm">{{ $t('account.org.domain') }}</span>
                                <span>{{ $t(`companyDomains.${accountData.org.domain}`) }}</span>
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
            </div>
        </div>
    </PageContainer>
</template>
