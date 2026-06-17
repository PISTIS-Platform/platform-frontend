<script setup lang="ts">
import type { ZodType } from 'zod';

import {
    cardDefaults,
    type CardForm,
    CardSchema,
    withdrawDefaults,
    type WithdrawForm,
    WithdrawSchema,
} from '~/schemas/user-wallet';

const { organisationFullname, factoryIban } = useRuntimeConfig().public;
const { data: session } = useAuth();

const { data: walletBalance, status: walletStatus } = useLazyFetch<{ dlt_amount: number }>('/api/wallet', {
    method: 'POST',
});
const { data: fiatBalance, status: fiatStatus } = useLazyFetch<{ balance: number }>('/api/wallet/fiat-balance');

const EXCHANGE_RATE = 0.85;
const EXCHANGE_FEE = 0;
const MIN_EXCHANGE = 10;

const activeSection = ref<'exchange' | 'deposit' | 'withdraw' | null>(null);
const isSwapped = ref(false);
const coinsAmount = ref<string>('');
const fiatAmount = ref<string>('');
const depositMethod = ref<'bank' | 'card'>('bank');

const cardForm = reactive<CardForm>({ ...cardDefaults });
const cardErrors = reactive<Partial<Record<keyof CardForm, string>>>({});

const withdrawForm = reactive<WithdrawForm>({ ...withdrawDefaults });
const withdrawErrors = reactive<Partial<Record<keyof WithdrawForm, string>>>({});

const userName = computed(() => session.value?.user?.name ?? '');
const isExchangeOpen = computed(() => activeSection.value === 'exchange');
const isDepositOpen = computed(() => activeSection.value === 'deposit');
const isWithdrawOpen = computed(() => activeSection.value === 'withdraw');
const isWithdrawValid = computed(() => WithdrawSchema.safeParse(withdrawForm).success && !withdrawAmountError.value);

const makeAmountValidator = (
    getValue: () => string,
    getMax: () => number | undefined,
    invalidMessage: string,
    exceedMessage: (max: number) => string,
    min = 0,
) =>
    computed(() => {
        const raw = getValue();
        if (raw === '') return null;
        const num = parseFloat(raw);
        if (isNaN(num) || num <= 0 || num < min) return invalidMessage;
        const max = getMax();
        if (max !== undefined && num > max) return exceedMessage(max);
        return null;
    });

const makeFieldValidator =
    <T extends object>(schema: ZodType<T>, form: T, errors: Partial<Record<keyof T, string>>) =>
    (field: keyof T) => {
        const result = schema.safeParse(form);
        if (result.success) delete errors[field];
        else {
            const issue = result.error.issues.find((i) => i.path[0] === field);
            if (issue) errors[field] = issue.message;
            else delete errors[field];
        }
    };

const makeCancel =
    <T extends object>(form: T, defaults: T, errors: Partial<Record<keyof T, string>>, close: () => void) =>
    () => {
        Object.assign(form, { ...defaults });
        (Object.keys(errors) as (keyof T)[]).forEach((k) => delete errors[k]);
        close();
    };

const makeFormValidator =
    <T extends object>(schema: ZodType<T>, form: T, errors: Partial<Record<keyof T, string>>) =>
    () => {
        (Object.keys(errors) as (keyof T)[]).forEach((k) => delete errors[k]);
        const result = schema.safeParse(form);
        if (result.success) return true;
        result.error.issues.forEach((issue) => {
            const field = issue.path[0] as keyof T;
            if (field && !errors[field]) errors[field] = issue.message;
        });
        return false;
    };

const validateCardField = makeFieldValidator(CardSchema, cardForm, cardErrors);
const validateWithdrawField = makeFieldValidator(WithdrawSchema, withdrawForm, withdrawErrors);
const validateWithdrawForm = makeFormValidator(WithdrawSchema, withdrawForm, withdrawErrors);

const exchangeValidationError = makeAmountValidator(
    () => coinsAmount.value,
    () => walletBalance.value?.dlt_amount,
    `Minimum exchange is ${MIN_EXCHANGE} PISTIS Coins`,
    (max) => `Cannot exceed your balance of ${max.toLocaleString()} PISTIS Coins`,
    MIN_EXCHANGE,
);

const withdrawAmountError = makeAmountValidator(
    () => withdrawForm.amount,
    () => fiatBalance.value?.balance,
    'Enter a valid amount',
    (max) => `Cannot exceed your FIAT balance of ${max.toLocaleString()} EUR`,
);

const onWithdrawAmountInput = (val: string | number) => {
    let sanitized = String(val ?? '').replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) sanitized = `${parts[0]}.${parts.slice(1).join('')}`;
    withdrawForm.amount = sanitized;
    validateWithdrawField('amount');
};

const onExpiryInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) formatted = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    else if (digits.length >= 2) formatted = `${digits.slice(0, 2)} / `;
    cardForm.expiry = formatted;
    input.value = formatted;
    validateCardField('expiry');
};

const onAmountInput = (val: string, source: 'coins' | 'fiat') => {
    const num = parseFloat(val);
    const isCoins = source === 'coins';
    const [from, to] = isCoins ? [coinsAmount, fiatAmount] : [fiatAmount, coinsAmount];
    from.value = val;
    to.value = val === '' || isNaN(num) ? '' : (isCoins ? num * EXCHANGE_RATE : num / EXCHANGE_RATE).toFixed(2);
};

const toggleSection = (section: typeof activeSection.value) =>
    (activeSection.value = activeSection.value === section ? null : section);

const cancelExchange = () => {
    coinsAmount.value = '';
    fiatAmount.value = '';
    isSwapped.value = false;
    activeSection.value = null;
};

const confirmExchange = async () => await $fetch('/api/wallet/exchange', { method: 'POST' });
const confirmWithdraw = async () => {
    if (!validateWithdrawForm()) return;
    await $fetch('/api/wallet/withdraw', { method: 'POST' });
};

const cancelDeposit = makeCancel(cardForm, cardDefaults, cardErrors, () => (activeSection.value = null));
const cancelWithdraw = makeCancel(withdrawForm, withdrawDefaults, withdrawErrors, () => (activeSection.value = null));
</script>

<template>
    <PageContainer>
        <div class="w-full mt-4">
            <div class="flex gap-4 mt-4">
                <UCard class="flex-1">
                    <div class="flex flex-col gap-2 h-full">
                        <div class="flex items-center gap-2 text-gray-500 text-sm">
                            <UIcon name="i-heroicons-globe-alt" class="w-5 h-5" />
                            PISTIS Coins Balance
                        </div>
                        <USkeleton v-if="walletStatus === 'pending'" class="h-9 w-32" />
                        <span v-else class="text-3xl font-bold text-primary-700">
                            {{ walletBalance?.dlt_amount?.toLocaleString() ?? 'N/A' }}
                        </span>
                        <UBadge color="primary" variant="soft" class="w-fit mt-auto">Digital Currency</UBadge>
                    </div>
                </UCard>

                <UCard class="flex-1">
                    <div class="flex flex-col gap-2 h-full">
                        <div class="flex items-center gap-2 text-gray-500 text-sm">
                            <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
                            FIAT Wallet Balance
                        </div>
                        <USkeleton v-if="fiatStatus === 'pending'" class="h-9 w-32" />
                        <span v-else class="text-3xl font-bold text-green-700">
                            {{ fiatBalance?.balance.toLocaleString() }}
                        </span>
                        <UBadge color="green" variant="soft" class="w-fit mt-auto text-green-700">Euro Balance</UBadge>
                    </div>
                </UCard>
            </div>

            <!-- Exchange card -->
            <div class="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                    class="flex w-full items-center gap-3 py-3 px-4 transition-colors duration-150"
                    :class="isExchangeOpen ? 'bg-primary-50 hover:bg-primary-100' : 'bg-white hover:bg-primary-50'"
                    @click="toggleSection('exchange')"
                >
                    <div class="bg-primary-100 rounded-lg p-2">
                        <UIcon name="i-heroicons-arrows-right-left" class="w-5 h-5 text-primary-600" />
                    </div>
                    <span class="font-semibold text-gray-800 flex-1 text-left">
                        Exchange PISTIS Coins to/from FIAT Money
                    </span>
                    <UIcon
                        name="i-heroicons-chevron-up-20-solid"
                        class="w-5 h-5 text-primary-600 transition-transform duration-200"
                        :class="{ 'rotate-180': !isExchangeOpen }"
                    />
                </button>

                <div v-if="isExchangeOpen" class="flex flex-col gap-2 p-6">
                    <p class="text-sm text-gray-600">
                        Enter an amount in either field to calculate the exchange. Current rate:
                        <strong>1 PISTIS Coin = {{ EXCHANGE_RATE }} PC</strong>
                    </p>

                    <div class="flex items-end gap-6 mt-1">
                        <div class="flex-1 flex flex-col gap-1">
                            <label class="text-xs font-semibold text-primary-500 tracking-wide uppercase">From</label>
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                {{ isSwapped ? 'FIAT Money (EUR)' : 'PISTIS Coins' }}
                            </label>
                            <UInput
                                v-if="!isSwapped"
                                :model-value="coinsAmount"
                                type="number"
                                size="lg"
                                placeholder="0"
                                :max="walletBalance?.dlt_amount"
                                trailing-icon="i-heroicons-globe-alt"
                                @update:model-value="(v) => onAmountInput(v, 'coins')"
                            />
                            <UInput
                                v-else
                                :model-value="fiatAmount"
                                type="number"
                                size="lg"
                                placeholder="0.00"
                                @update:model-value="(v) => onAmountInput(v, 'fiat')"
                            />
                        </div>

                        <div class="flex flex-col items-center gap-1 pb-1">
                            <UButton
                                icon="i-heroicons-arrows-right-left"
                                color="primary"
                                variant="solid"
                                size="lg"
                                class="rounded-full"
                                @click="isSwapped = !isSwapped"
                            />
                            <span class="text-xs text-gray-500">Exchange</span>
                        </div>

                        <div class="flex-1 flex flex-col gap-1">
                            <label class="text-xs font-semibold text-primary-500 tracking-wide uppercase">To</label>
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                {{ isSwapped ? 'PISTIS Coins' : 'FIAT Money (EUR)' }}
                            </label>
                            <UInput
                                v-if="!isSwapped"
                                :model-value="fiatAmount"
                                type="number"
                                size="lg"
                                placeholder="0.00"
                                @update:model-value="(v) => onAmountInput(v, 'fiat')"
                            />
                            <UInput
                                v-else
                                :model-value="coinsAmount"
                                type="number"
                                size="lg"
                                placeholder="0"
                                :max="walletBalance?.dlt_amount"
                                trailing-icon="i-heroicons-globe-alt"
                                @update:model-value="(v) => onAmountInput(v, 'coins')"
                            />
                        </div>
                    </div>

                    <p v-if="exchangeValidationError" class="text-xs text-red-500 flex items-center gap-1">
                        <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
                        {{ exchangeValidationError }}
                    </p>
                    <p class="text-xs text-gray-500 flex items-center gap-1">
                        <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
                        Exchange fee: {{ EXCHANGE_FEE }}% | Minimum exchange: {{ MIN_EXCHANGE }} PISTIS Coins
                    </p>

                    <div class="flex gap-3 mt-2">
                        <UButton
                            color="primary"
                            variant="solid"
                            icon="i-heroicons-arrows-right-left"
                            :disabled="coinsAmount === '' || !!exchangeValidationError"
                            @click="confirmExchange"
                        >
                            Confirm Exchange
                        </UButton>
                        <UButton color="white" variant="solid" @mousedown.prevent @click="cancelExchange"
                            >Cancel</UButton
                        >
                    </div>
                </div>
            </div>
            <!-- Deposit card -->
            <div class="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                    class="flex w-full items-center gap-3 py-3 px-4 transition-colors duration-150"
                    :class="isDepositOpen ? 'bg-primary-50 hover:bg-primary-100' : 'bg-white hover:bg-primary-50'"
                    @click="toggleSection('deposit')"
                >
                    <div class="bg-green-100 rounded-lg p-2">
                        <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5 text-green-600" />
                    </div>
                    <span class="font-semibold text-gray-800 flex-1 text-left">Deposit</span>
                    <UIcon
                        name="i-heroicons-chevron-up-20-solid"
                        class="w-5 h-5 text-primary-600 transition-transform duration-200"
                        :class="{ 'rotate-180': !isDepositOpen }"
                    />
                </button>

                <div v-if="isDepositOpen" class="flex flex-col gap-4 p-6">
                    <p class="text-sm text-gray-600">Choose your preferred deposit method:</p>

                    <!-- Method selection -->
                    <div class="flex gap-4">
                        <button
                            class="flex-1 flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors duration-150"
                            :class="
                                depositMethod === 'bank'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 bg-white hover:border-primary-300'
                            "
                            @click="depositMethod = 'bank'"
                        >
                            <div
                                class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                                :class="depositMethod === 'bank' ? 'border-primary-500' : 'border-gray-400'"
                            >
                                <div v-if="depositMethod === 'bank'" class="w-2 h-2 rounded-full bg-primary-500" />
                            </div>
                            <UIcon name="i-heroicons-building-library" class="w-5 h-5 text-gray-600" />
                            <div class="text-left">
                                <div class="font-semibold text-gray-800 text-sm">Bank Transfer</div>
                                <div class="text-xs text-gray-500">SEPA / Wire Transfer</div>
                            </div>
                        </button>

                        <button
                            class="flex-1 flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors duration-150"
                            :class="
                                depositMethod === 'card'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 bg-white hover:border-primary-300'
                            "
                            @click="depositMethod = 'card'"
                        >
                            <div
                                class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                                :class="depositMethod === 'card' ? 'border-primary-500' : 'border-gray-400'"
                            >
                                <div v-if="depositMethod === 'card'" class="w-2 h-2 rounded-full bg-primary-500" />
                            </div>
                            <UIcon name="i-heroicons-credit-card" class="w-5 h-5 text-gray-600" />
                            <div class="text-left">
                                <div class="font-semibold text-gray-800 text-sm">Credit Card</div>
                                <div class="text-xs text-gray-500">Visa, Mastercard</div>
                            </div>
                        </button>
                    </div>

                    <!-- Bank Transfer details -->
                    <div v-if="depositMethod === 'bank'" class="flex flex-col gap-3">
                        <div class="rounded-lg border border-dashed border-primary-300 bg-primary-50 px-5 py-4">
                            <p class="text-xs font-semibold text-primary-500 tracking-wide uppercase mb-1">
                                PISTIS Platform IBAN
                            </p>
                            <p class="text-xl font-bold text-gray-900 tracking-wider">{{ factoryIban }}</p>
                        </div>

                        <div class="rounded-lg border border-yellow-300 bg-yellow-50 px-5 py-4 flex flex-col gap-2">
                            <p class="text-sm text-gray-700">
                                📋 Please transfer funds to the IBAN above. In the
                                <strong>Remittance Information / Payment Reference</strong> field, include exactly:
                            </p>
                            <p class="font-bold text-gray-800">
                                PISTIS · <span class="uppercase">{{ organisationFullname }}</span> · {{ userName }}
                            </p>
                            <p class="text-sm text-yellow-700">
                                Transfers without this reference may be delayed or rejected.
                            </p>
                        </div>
                    </div>

                    <!-- Credit Card details -->
                    <div v-else-if="depositMethod === 'card'" class="flex flex-col gap-3">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                Cardholder Name
                            </label>
                            <UInput
                                v-model="cardForm.name"
                                size="lg"
                                placeholder="Jane Doe"
                                @update:model-value="() => validateCardField('name')"
                            />
                            <p v-if="cardErrors.name" class="text-xs text-red-500">{{ cardErrors.name }}</p>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                Card Number
                            </label>
                            <UInput
                                v-model="cardForm.number"
                                size="lg"
                                placeholder="1234 5678 9012 3456"
                                maxlength="16"
                                @keypress="(e: KeyboardEvent) => !/\d/.test(e.key) && e.preventDefault()"
                                @update:model-value="() => validateCardField('number')"
                            />
                            <p v-if="cardErrors.number" class="text-xs text-red-500">{{ cardErrors.number }}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                    Expiry Date
                                </label>
                                <UInput
                                    :value="cardForm.expiry"
                                    size="lg"
                                    placeholder="MM / YY"
                                    maxlength="7"
                                    @input="onExpiryInput"
                                />
                                <p v-if="cardErrors.expiry" class="text-xs text-red-500">{{ cardErrors.expiry }}</p>
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                    CVV / CVC
                                </label>
                                <UInput
                                    v-model="cardForm.cvv"
                                    size="lg"
                                    placeholder="···"
                                    type="password"
                                    maxlength="4"
                                    @keypress="(e: KeyboardEvent) => !/\d/.test(e.key) && e.preventDefault()"
                                    @update:model-value="() => validateCardField('cvv')"
                                />
                                <p v-if="cardErrors.cvv" class="text-xs text-red-500">{{ cardErrors.cvv }}</p>
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                    Billing Address
                                </label>
                                <UInput
                                    v-model="cardForm.billingAddress"
                                    size="lg"
                                    placeholder="Street, City"
                                    @update:model-value="() => validateCardField('billingAddress')"
                                />
                                <p v-if="cardErrors.billingAddress" class="text-xs text-red-500">
                                    {{ cardErrors.billingAddress }}
                                </p>
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                    Postal Code
                                </label>
                                <UInput
                                    v-model="cardForm.postalCode"
                                    size="lg"
                                    placeholder="12345"
                                    @update:model-value="() => validateCardField('postalCode')"
                                />
                                <p v-if="cardErrors.postalCode" class="text-xs text-red-500">
                                    {{ cardErrors.postalCode }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div v-if="depositMethod === 'card'" class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                            Amount to Deposit (PC)
                        </label>
                        <UInput
                            v-model="cardForm.amount"
                            type="number"
                            size="lg"
                            placeholder="0.00"
                            @update:model-value="() => validateCardField('amount')"
                        />
                        <p v-if="cardErrors.amount" class="text-xs text-red-500">{{ cardErrors.amount }}</p>
                    </div>

                    <div v-if="depositMethod === 'card'" class="flex gap-3">
                        <UButton color="primary" variant="solid" icon="i-heroicons-lock-closed">
                            Confirm Deposit
                        </UButton>
                        <UButton color="white" variant="solid" @click="cancelDeposit">Cancel</UButton>
                    </div>

                    <p v-if="depositMethod === 'card'" class="text-xs text-gray-500 flex items-center gap-1">
                        <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 shrink-0" />
                        Your card data is encrypted and handled securely. PISTIS does not store card details.
                    </p>
                </div>
            </div>

            <!-- Withdraw card -->
            <div class="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                    class="flex w-full items-center gap-3 py-3 px-4 transition-colors duration-150"
                    :class="isWithdrawOpen ? 'bg-primary-50 hover:bg-primary-100' : 'bg-white hover:bg-primary-50'"
                    @click="toggleSection('withdraw')"
                >
                    <div class="bg-blue-100 rounded-lg p-2">
                        <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-blue-600" />
                    </div>
                    <span class="font-semibold text-gray-800 flex-1 text-left">Withdraw</span>
                    <UIcon
                        name="i-heroicons-chevron-up-20-solid"
                        class="w-5 h-5 text-primary-600 transition-transform duration-200"
                        :class="{ 'rotate-180': !isWithdrawOpen }"
                    />
                </button>

                <div v-if="isWithdrawOpen" class="flex flex-col gap-4 p-6">
                    <p class="text-sm text-gray-600">
                        Withdraw FIAT funds to your bank account. Processing time: 1–3 business days.
                    </p>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                            Amount to Withdraw (PC)
                        </label>
                        <UInput
                            :model-value="withdrawForm.amount"
                            type="number"
                            inputmode="decimal"
                            min="0"
                            :max="fiatBalance?.balance"
                            size="lg"
                            placeholder="0.00"
                            @update:model-value="onWithdrawAmountInput"
                        />
                        <p v-if="withdrawAmountError || withdrawErrors.amount" class="text-xs text-red-500">
                            {{ withdrawAmountError ?? withdrawErrors.amount }}
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
                            @update:model-value="() => validateWithdrawField('iban')"
                        />
                        <p v-if="withdrawErrors.iban" class="text-xs text-red-500">{{ withdrawErrors.iban }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                Bank Name
                            </label>
                            <UInput
                                v-model="withdrawForm.bankName"
                                size="lg"
                                placeholder="e.g. Alpha Bank"
                                @update:model-value="() => validateWithdrawField('bankName')"
                            />
                            <p v-if="withdrawErrors.bankName" class="text-xs text-red-500">
                                {{ withdrawErrors.bankName }}
                            </p>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                Bank Address
                            </label>
                            <UInput
                                v-model="withdrawForm.bankAddress"
                                size="lg"
                                placeholder="Street, City, Country"
                                @update:model-value="() => validateWithdrawField('bankAddress')"
                            />
                            <p v-if="withdrawErrors.bankAddress" class="text-xs text-red-500">
                                {{ withdrawErrors.bankAddress }}
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                            Recipient Name
                        </label>
                        <UInput
                            v-model="withdrawForm.recipientName"
                            size="lg"
                            placeholder="Jane Doe"
                            @update:model-value="() => validateWithdrawField('recipientName')"
                        />
                        <p v-if="withdrawErrors.recipientName" class="text-xs text-red-500">
                            {{ withdrawErrors.recipientName }}
                        </p>
                    </div>

                    <div class="flex gap-3">
                        <UButton
                            color="red"
                            variant="solid"
                            icon="i-heroicons-arrow-down-tray"
                            :disabled="!isWithdrawValid"
                            @click="confirmWithdraw"
                        >
                            Confirm Withdrawal
                        </UButton>
                        <UButton color="white" variant="solid" @click="cancelWithdraw">Cancel</UButton>
                    </div>

                    <p class="text-xs text-gray-500 flex items-center gap-1">
                        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-yellow-500 shrink-0" />
                        Please double-check all bank details before confirming. PISTIS is not liable for funds sent to
                        incorrect accounts.
                    </p>
                </div>
            </div>
        </div>
    </PageContainer>
    <div class="pb-12" />
</template>
