<script setup lang="ts">
const { data, status, error } = useFetch<Record<string, any>[]>(`/api/invest/get-user-investments`);
</script>

<template>
    <div class="justify-center items-center max-w-7xl w-full text-gray-600">
        <PageContainer>
            <UProgress v-if="status === 'pending'" />
            <UAlert
                v-else-if="error"
                :title="$t('invest.investmentsError') + ': ' + (error.statusMessage || error.message || error.status)"
                color="red"
                variant="subtle"
                icon="material-symbols:error-outline-rounded"
            />
            <UAlert
                v-else-if="!data || !data.length"
                :title="$t('invest.notFoundError')"
                color="yellow"
                variant="subtle"
                icon="nonicons:not-found-16"
            />
            <div v-else class="flex flex-col gap-6">
                <SubHeading :title="$t('invest.userInvestments')" :info="$t('invest.subtitle')" />
                <UCard class="w-full">
                    {{ data?.[0] }}
                </UCard>
            </div>
        </PageContainer>
    </div>
</template>
