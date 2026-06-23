<script setup lang="ts">
import { withdrawDefaults, type WithdrawForm, WithdrawSchema } from '~/schemas/user-wallet';
import { amountError, makeFieldValidator, makeFormValidator, sanitizeDecimal } from '~/utils/wallet';

const props = defineProps<{ fiatBalance?: number; fiatPending: boolean }>();
const emit = defineEmits<{ close: []; success: [] }>();

const withdrawForm = reactive<WithdrawForm>({ ...withdrawDefaults });
const withdrawErrors = reactive<Partial<Record<keyof WithdrawForm, string>>>({});

const validateField = makeFieldValidator(WithdrawSchema, withdrawForm, withdrawErrors);
const validateForm = makeFormValidator(WithdrawSchema, withdrawForm, withdrawErrors);

const resetForm = () => {
    Object.assign(withdrawForm, { ...withdrawDefaults });
    (Object.keys(withdrawErrors) as (keyof WithdrawForm)[]).forEach((k) => delete withdrawErrors[k]);
};

const cancel = () => {
    resetForm();
    emit('close');
};

const isFiatBalanceUnavailable = computed(() => props.fiatBalance === undefined);
const amountErrorMessage = computed(() =>
    amountError(withdrawForm.amount, {
        max: props.fiatBalance,
        tooSmall: 'Enter a valid amount',
        tooLarge: 'Cannot exceed your FIAT balance',
    }),
);
const isValid = computed(
    () =>
        WithdrawSchema.safeParse(withdrawForm).success && !amountErrorMessage.value && !isFiatBalanceUnavailable.value,
);

const onAmountInput = (val: string | number) => {
    withdrawForm.amount = sanitizeDecimal(val);
    validateField('amount');
};

const { showErrorMessage } = useAlertMessage();
const isSubmitting = ref(false);

const confirm = async () => {
    if (isSubmitting.value || !validateForm()) return;
    isSubmitting.value = true;
    try {
        await $fetch('/api/wallet/withdraw', {
            method: 'POST',
            body: { amount: withdrawForm.amount, iban: withdrawForm.iban },
        });
        resetForm();
        emit('success');
    } catch {
        showErrorMessage('Withdrawal failed. Please try again later.');
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <div
            v-if="!fiatPending && isFiatBalanceUnavailable"
            class="rounded-lg border border-yellow-300 bg-yellow-50 px-5 py-4 flex items-start gap-2"
        >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p class="text-sm text-yellow-700">
                Your FIAT wallet balance is currently unavailable. Withdrawals are temporarily disabled. Please try
                again later.
            </p>
        </div>
        <p class="text-sm text-gray-600">
            Withdraw FIAT funds to your bank account. Processing time: 1–3 business days.
        </p>

        <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Amount to Withdraw (PSTC)</label>
            <UInput
                :model-value="withdrawForm.amount"
                type="number"
                inputmode="decimal"
                min="0"
                :max="fiatBalance"
                size="lg"
                placeholder="0.00"
                @update:model-value="onAmountInput"
            />
            <p v-if="amountErrorMessage || withdrawErrors.amount" class="text-xs text-red-500">
                {{ amountErrorMessage ?? withdrawErrors.amount }}
            </p>
        </div>

        <div class="border-t border-gray-200" />

        <p class="text-xs font-semibold text-gray-700 tracking-wide uppercase">Beneficiary Bank Details</p>

        <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">IBAN</label>
            <UInput
                v-model="withdrawForm.iban"
                size="lg"
                placeholder="e.g. GR94 6171 3486 3803 AB1C 23DE F45"
                @update:model-value="() => validateField('iban')"
            />
            <p v-if="withdrawErrors.iban" class="text-xs text-red-500">{{ withdrawErrors.iban }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Bank Name</label>
                <UInput
                    v-model="withdrawForm.bankName"
                    size="lg"
                    placeholder="e.g. Alpha Bank"
                    @update:model-value="() => validateField('bankName')"
                />
                <p v-if="withdrawErrors.bankName" class="text-xs text-red-500">{{ withdrawErrors.bankName }}</p>
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Bank Address</label>
                <UInput
                    v-model="withdrawForm.bankAddress"
                    size="lg"
                    placeholder="Street, City, Country"
                    @update:model-value="() => validateField('bankAddress')"
                />
                <p v-if="withdrawErrors.bankAddress" class="text-xs text-red-500">{{ withdrawErrors.bankAddress }}</p>
            </div>
        </div>

        <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Recipient Name</label>
            <UInput
                v-model="withdrawForm.recipientName"
                size="lg"
                placeholder="Account holder name"
                @update:model-value="() => validateField('recipientName')"
            />
            <p v-if="withdrawErrors.recipientName" class="text-xs text-red-500">{{ withdrawErrors.recipientName }}</p>
        </div>

        <div class="flex gap-3">
            <UButton
                color="red"
                variant="solid"
                icon="i-heroicons-arrow-down-tray"
                :loading="isSubmitting"
                :disabled="isSubmitting || !isValid"
                @click="confirm"
            >
                Confirm Withdrawal
            </UButton>
            <UButton color="white" variant="solid" @click="cancel">Cancel</UButton>
        </div>

        <p class="text-xs text-gray-500 flex items-center gap-1">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-yellow-500 shrink-0" />
            Please double-check all bank details before confirming. PISTIS is not liable for funds sent to incorrect
            accounts.
        </p>
    </div>
</template>
