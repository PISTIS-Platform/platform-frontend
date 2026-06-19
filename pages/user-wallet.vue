<script setup lang="ts">
import { parseAmount } from '~/utils/wallet';

const { data: coinsData, status: coinsStatus } = useLazyFetch<{ dlt_amount: number }>('/api/wallet', {
    method: 'POST',
});

const { data: fiatData, status: fiatStatus } = useLazyFetch<{ amount: string; currency: string }>(
    '/api/wallet/fiat-balance',
);

const { data: ibanData } = useLazyFetch<{ iban: string }>('/api/wallet/factory-iban');

const factoryIban = computed(() => ibanData.value?.iban ?? '');

const activeSection = ref<'exchange' | 'deposit' | 'withdraw' | null>(null);

const toggleSection = (section: typeof activeSection.value) =>
    (activeSection.value = activeSection.value === section ? null : section);
const close = () => (activeSection.value = null);

const coinsBalance = computed(() => parseAmount(coinsData.value?.dlt_amount));
const fiatBalance = computed(() => parseAmount(fiatData.value?.amount));
</script>

<template>
    <PageContainer>
        <div class="w-full mt-4">
            <div class="flex gap-4 mt-4">
                <WalletBalance
                    label="PISTIS Coins Balance"
                    icon="i-heroicons-globe-alt"
                    :amount="coinsBalance"
                    :pending="coinsStatus === 'pending'"
                    value-class="text-primary-700"
                    badge-color="primary"
                    badge-label="Digital Currency"
                />
                <WalletBalance
                    label="FIAT Wallet Balance"
                    icon="i-heroicons-banknotes"
                    :amount="fiatBalance"
                    :pending="fiatStatus === 'pending'"
                    value-class="text-green-700"
                    badge-color="green"
                    badge-label="Euro Balance"
                    badge-class="text-green-700"
                />
            </div>

            <WalletSection
                title="Exchange PISTIS Coins to/from FIAT Money"
                icon="i-heroicons-arrows-right-left"
                :open="activeSection === 'exchange'"
                @toggle="toggleSection('exchange')"
            >
                <WalletExchange :coins-balance="coinsBalance" :fiat-balance="fiatBalance" @close="close" />
            </WalletSection>

            <WalletSection
                title="Deposit"
                icon="i-heroicons-arrow-up-tray"
                icon-wrapper-class="bg-green-100"
                icon-class="text-green-600"
                :open="activeSection === 'deposit'"
                @toggle="toggleSection('deposit')"
            >
                <WalletDeposit :factory-iban="factoryIban" @close="close" />
            </WalletSection>

            <WalletSection
                title="Withdraw"
                icon="i-heroicons-arrow-down-tray"
                icon-wrapper-class="bg-blue-100"
                icon-class="text-blue-600"
                :open="activeSection === 'withdraw'"
                @toggle="toggleSection('withdraw')"
            >
                <WalletWithdraw :fiat-balance="fiatBalance" :fiat-pending="fiatStatus === 'pending'" @close="close" />
            </WalletSection>
        </div>
    </PageContainer>
    <div class="pb-12" />
</template>
