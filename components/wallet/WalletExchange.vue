<script setup lang="ts">
import { CURRENCY, DIRECTION_OPTIONS, EXCHANGE_FEE, SIDES } from '~/constants/wallet';
import type { Direction } from '~/interfaces/wallet';
import { amountError, convertAmount, sanitizeInteger } from '~/utils/wallet';

const props = defineProps<{
    coinsBalance?: number;
    fiatBalance?: number;
}>();

const emit = defineEmits<{ close: []; success: [] }>();

const direction = ref<Direction>('cash-in');
const payAmount = ref<string>('');

const isCashIn = computed(() => direction.value === 'cash-in');
const paySide = computed(() => CURRENCY[SIDES[direction.value].pay]);
const receiveSide = computed(() => CURRENCY[SIDES[direction.value].receive]);
// The user edits `payAmount`; the receive side is derived from the exchange rate.
const receiveAmount = computed(() => convertAmount(payAmount.value));
// The cash-in/cash-out endpoints always take the FIAT amount.
const exchangeFiatAmount = computed(() => (isCashIn.value ? payAmount.value : receiveAmount.value));

const validationError = computed(() =>
    isCashIn.value
        ? amountError(payAmount.value, {
              max: props.fiatBalance,
              tooSmall: 'Enter a valid amount',
              tooLarge: 'Cannot exceed your FIAT balance',
          })
        : amountError(payAmount.value, {
              max: props.coinsBalance,
              tooSmall: 'Enter a valid amount',
              tooLarge: 'Cannot exceed your PISTIS Coins balance',
          }),
);

// The balance required for the current direction (FIAT to buy coins, coins to sell).
const balanceUnavailable = computed(() => (isCashIn.value ? props.fiatBalance : props.coinsBalance) === undefined);
const unavailableMessage = computed(() =>
    isCashIn.value
        ? 'Your FIAT wallet balance is currently unavailable. Exchanging is temporarily disabled. Please try again later.'
        : 'Your PISTIS Coins balance is currently unavailable. Exchanging is temporarily disabled. Please try again later.',
);

const onPayAmountInput = (val: string | number) => (payAmount.value = sanitizeInteger(val));
const toggleDirection = () => (direction.value = isCashIn.value ? 'cash-out' : 'cash-in');

const resetForm = () => {
    payAmount.value = '';
    direction.value = 'cash-in';
};

const cancel = () => {
    resetForm();
    emit('close');
};

const { showErrorMessage } = useAlertMessage();
const isSubmitting = ref(false);

const confirm = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    try {
        await $fetch(isCashIn.value ? '/api/wallet/cash-in' : '/api/wallet/cash-out', {
            method: 'POST',
            body: { amount: exchangeFiatAmount.value },
        });
        resetForm();
        emit('success');
    } catch {
        showErrorMessage(
            isCashIn.value ? 'Cash-in failed. Please try again later.' : 'Cash-out failed. Please try again later.',
        );
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="flex flex-col gap-2">
        <div
            v-if="balanceUnavailable"
            class="rounded-lg border border-yellow-300 bg-yellow-50 px-5 py-4 flex items-start gap-2 mb-2"
        >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p class="text-sm text-yellow-700">{{ unavailableMessage }}</p>
        </div>

        <p class="text-sm text-gray-600">Enter the amount you want to exchange.</p>

        <!-- Direction selection -->
        <div class="flex gap-4">
            <button
                v-for="opt in DIRECTION_OPTIONS"
                :key="opt.value"
                class="flex-1 min-w-0 flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors duration-150"
                :class="
                    direction === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-primary-300'
                "
                @click="direction = opt.value"
            >
                <div
                    class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                    :class="direction === opt.value ? 'border-primary-500' : 'border-gray-400'"
                >
                    <div v-if="direction === opt.value" class="w-2 h-2 rounded-full bg-primary-500" />
                </div>
                <UIcon :name="opt.icon" class="w-5 h-5" :class="opt.iconClass" />
                <div class="text-left">
                    <div class="font-semibold text-gray-800 text-sm">{{ opt.title }}</div>
                    <div class="text-xs text-gray-500">{{ opt.subtitle }}</div>
                </div>
            </button>
        </div>

        <div class="flex items-end gap-6 mt-4">
            <div class="flex-1 flex flex-col gap-1">
                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">{{ paySide.label }}</label>
                <UInput
                    :model-value="payAmount"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    step="1"
                    size="lg"
                    :placeholder="paySide.placeholder"
                    :trailing-icon="paySide.icon"
                    @keypress="(e: KeyboardEvent) => !/\d/.test(e.key) && e.preventDefault()"
                    @update:model-value="onPayAmountInput"
                />
            </div>

            <div class="flex flex-col items-center gap-1 pb-1">
                <UButton
                    icon="i-heroicons-arrows-right-left"
                    color="primary"
                    variant="solid"
                    size="lg"
                    class="rounded-full"
                    @click="toggleDirection"
                />
                <span class="text-xs text-gray-500">Exchange</span>
            </div>

            <div class="flex-1 flex flex-col gap-1">
                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                    {{ receiveSide.label }}
                </label>
                <UInput
                    :model-value="receiveAmount"
                    type="number"
                    size="lg"
                    readonly
                    :placeholder="receiveSide.placeholder"
                    :trailing-icon="receiveSide.icon"
                />
            </div>
        </div>

        <p v-if="validationError" class="text-xs text-red-500 flex items-center gap-1">
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
            {{ validationError }}
        </p>
        <p class="text-xs text-gray-500 flex items-center gap-1">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
            Exchange fee: {{ EXCHANGE_FEE }}%
        </p>

        <div class="flex gap-3 mt-2">
            <UButton
                color="primary"
                variant="solid"
                icon="i-heroicons-arrows-right-left"
                :loading="isSubmitting"
                :disabled="isSubmitting || balanceUnavailable || !payAmount || !!validationError"
                @click="confirm"
            >
                Confirm Exchange
            </UButton>
            <UButton color="white" variant="solid" @mousedown.prevent @click="cancel">Cancel</UButton>
        </div>
    </div>
</template>
