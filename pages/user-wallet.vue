<script setup lang="ts">
const { organisationFullname, factoryIban } = useRuntimeConfig().public;
const { data: session } = useAuth();

const { data: walletBalance, status: walletStatus } = useLazyFetch<{ dlt_amount: number }>('/api/wallet', {
    method: 'POST',
});
const { data: fiatBalance, status: fiatStatus } = useLazyFetch<{ balance: number }>('/api/wallet/fiat-balance');

const EXCHANGE_RATE = 0.85;
const EXCHANGE_FEE = 0;
const MIN_EXCHANGE = 10;

const isExchangeOpen = ref(false);
const isDepositOpen = ref(false);
const isWithdrawOpen = ref(false);
const isSwapped = ref(false);

const coinsAmount = ref<string>('0');
const fiatAmount = ref<string>('0.00');

const depositMethod = ref<'bank' | 'card'>('bank');
const depositAmount = ref<string>('');

const cardholderName = ref<string>('');
const cardNumber = ref<string>('');
const cardNumberError = ref<string | undefined>(undefined);
const validateCardNumber = () => {
    cardNumberError.value = cardNumber.value.length !== 16 ? 'Card number must be 16 digits' : undefined;
};
const cardExpiry = ref<string>('');
const cardExpiryError = ref<string | undefined>(undefined);
const onExpiryInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) formatted = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    else if (digits.length >= 2) formatted = `${digits.slice(0, 2)} / `;
    cardExpiry.value = formatted;
    input.value = formatted;
    cardExpiryError.value = undefined;
};
const validateCardExpiry = () => {
    const digits = cardExpiry.value.replace(/\D/g, '');
    if (digits.length < 4) {
        cardExpiryError.value = 'Enter a valid expiry date';
        return;
    }
    const month = parseInt(digits.slice(0, 2));
    cardExpiryError.value = month < 1 || month > 12 ? 'Month must be between 01 and 12' : undefined;
};
const cardCvv = ref<string>('');
const cardBillingAddress = ref<string>('');
const cardPostalCode = ref<string>('');

const withdrawAmount = ref<string>('');
const withdrawIban = ref<string>('');
const withdrawRecipientName = ref<string>('');
const withdrawOrgName = ref<string>('');
const withdrawBankName = ref<string>('');
const withdrawBankAddress = ref<string>('');

const userName = computed(() => session.value?.user?.name ?? '');

const onCoinsInput = (val: string) => {
    const num = parseFloat(val);
    coinsAmount.value = val;
    fiatAmount.value = isNaN(num) ? '0.00' : (num * EXCHANGE_RATE).toFixed(2);
};

const onFiatInput = (val: string) => {
    const num = parseFloat(val);
    fiatAmount.value = val;
    coinsAmount.value = isNaN(num) ? '0' : (num / EXCHANGE_RATE).toFixed(2);
};

const swap = () => {
    isSwapped.value = !isSwapped.value;
};

const coinsTouched = ref(false);

const exchangeValidationError = computed(() => {
    const coins = parseFloat(coinsAmount.value);
    if (isNaN(coins) || coins < MIN_EXCHANGE) return `Minimum exchange is ${MIN_EXCHANGE} PISTIS Coins`;
    const maxCoins = walletBalance.value?.dlt_amount;
    if (maxCoins !== undefined && coins > maxCoins)
        return `Cannot exceed your balance of ${maxCoins.toLocaleString()} PISTIS Coins`;
    return null;
});

const cancel = () => {
    coinsAmount.value = '0';
    fiatAmount.value = '0.00';
    isSwapped.value = false;
    coinsTouched.value = false;
    isExchangeOpen.value = false;
};

const confirmExchange = async () => await $fetch('/api/wallet/exchange', { method: 'POST' });

const cancelDeposit = () => {
    depositAmount.value = '';
    cardholderName.value = '';
    cardNumber.value = '';
    cardExpiry.value = '';
    cardCvv.value = '';
    cardBillingAddress.value = '';
    cardPostalCode.value = '';
    isDepositOpen.value = false;
};

const confirmDeposit = async () => await $fetch('/api/wallet/deposit', { method: 'POST' });

const cancelWithdraw = () => {
    withdrawAmount.value = '';
    withdrawIban.value = '';
    withdrawRecipientName.value = '';
    withdrawOrgName.value = '';
    withdrawBankName.value = '';
    withdrawBankAddress.value = '';
    isWithdrawOpen.value = false;
};

const confirmWithdraw = async () => await $fetch('/api/wallet/withdraw', { method: 'POST' });
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
                    @click="isExchangeOpen = !isExchangeOpen"
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
                        <strong>1 PISTIS Coin = €{{ EXCHANGE_RATE }}</strong>
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
                                :max="walletBalance?.dlt_amount"
                                trailing-icon="i-heroicons-globe-alt"
                                @update:model-value="onCoinsInput"
                                @blur="coinsTouched = true"
                            />
                            <UInput
                                v-else
                                :model-value="fiatAmount"
                                type="number"
                                size="lg"
                                trailing-icon="i-heroicons-currency-euro"
                                @update:model-value="onFiatInput"
                            />
                        </div>

                        <div class="flex flex-col items-center gap-1 pb-1">
                            <UButton
                                icon="i-heroicons-arrows-right-left"
                                color="primary"
                                variant="solid"
                                size="lg"
                                class="rounded-full"
                                @click="swap"
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
                                trailing-icon="i-heroicons-currency-euro"
                                @update:model-value="onFiatInput"
                            />
                            <UInput
                                v-else
                                :model-value="coinsAmount"
                                type="number"
                                size="lg"
                                :max="walletBalance?.dlt_amount"
                                trailing-icon="i-heroicons-globe-alt"
                                @update:model-value="onCoinsInput"
                                @blur="coinsTouched = true"
                            />
                        </div>
                    </div>

                    <p
                        v-if="coinsTouched && exchangeValidationError"
                        class="text-xs text-red-500 flex items-center gap-1"
                    >
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
                            :disabled="!!exchangeValidationError"
                            @click="confirmExchange"
                        >
                            Confirm Exchange
                        </UButton>
                        <UButton color="white" variant="solid" @mousedown.prevent @click="cancel">Cancel</UButton>
                    </div>
                </div>
            </div>
            <!-- Deposit card -->
            <div class="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                    class="flex w-full items-center gap-3 py-3 px-4 transition-colors duration-150"
                    :class="isDepositOpen ? 'bg-primary-50 hover:bg-primary-100' : 'bg-white hover:bg-primary-50'"
                    @click="isDepositOpen = !isDepositOpen"
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
                            <UInput v-model="cardholderName" size="lg" placeholder="Jane Doe" />
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                Card Number
                            </label>
                            <UInput
                                v-model="cardNumber"
                                size="lg"
                                placeholder="1234 5678 9012 3456"
                                maxlength="16"
                                @keypress="(e: KeyboardEvent) => !/\d/.test(e.key) && e.preventDefault()"
                                @blur="validateCardNumber"
                            />
                            <p v-if="cardNumberError" class="text-xs text-red-500">{{ cardNumberError }}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                    Expiry Date
                                </label>
                                <UInput
                                    v-model="cardExpiry"
                                    size="lg"
                                    placeholder="MM / YY"
                                    maxlength="7"
                                    @input="onExpiryInput"
                                    @blur="validateCardExpiry"
                                />
                                <p v-if="cardExpiryError" class="text-xs text-red-500">{{ cardExpiryError }}</p>
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                    CVV / CVC
                                </label>
                                <UInput
                                    v-model="cardCvv"
                                    size="lg"
                                    placeholder="···"
                                    type="password"
                                    maxlength="4"
                                    @keypress="(e: KeyboardEvent) => !/\d/.test(e.key) && e.preventDefault()"
                                />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                    Billing Address
                                </label>
                                <UInput v-model="cardBillingAddress" size="lg" placeholder="Street, City" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                    Postal Code
                                </label>
                                <UInput v-model="cardPostalCode" size="lg" placeholder="12345" />
                            </div>
                        </div>
                    </div>

                    <div v-if="depositMethod === 'card'" class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                            Amount to Deposit (EUR)
                        </label>
                        <UInput
                            v-model="depositAmount"
                            type="number"
                            size="lg"
                            placeholder="0.00"
                            trailing-icon="i-heroicons-currency-euro"
                        />
                    </div>

                    <div v-if="depositMethod === 'card'" class="flex gap-3">
                        <UButton color="primary" variant="solid" icon="i-heroicons-lock-closed" @click="confirmDeposit">
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
                    @click="isWithdrawOpen = !isWithdrawOpen"
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
                            Amount to Withdraw (EUR)
                        </label>
                        <UInput
                            v-model="withdrawAmount"
                            type="number"
                            size="lg"
                            placeholder="0.00"
                            trailing-icon="i-heroicons-currency-euro"
                        />
                    </div>

                    <div class="border-t border-gray-200" />

                    <p class="text-xs font-semibold text-gray-700 tracking-wide uppercase">Beneficiary Bank Details</p>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">IBAN</label>
                        <UInput v-model="withdrawIban" size="lg" placeholder="GR__ ____ ____ ____ ____ ___" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                Recipient Name
                            </label>
                            <UInput v-model="withdrawRecipientName" size="lg" placeholder="Jane Doe" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                Organisation Name
                            </label>
                            <UInput
                                v-model="withdrawOrgName"
                                size="lg"
                                :placeholder="organisationFullname?.toUpperCase()"
                            />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                Bank Name
                            </label>
                            <UInput v-model="withdrawBankName" size="lg" placeholder="e.g. Alpha Bank" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                Bank Address
                            </label>
                            <UInput v-model="withdrawBankAddress" size="lg" placeholder="Street, City, Country" />
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <UButton
                            color="red"
                            variant="solid"
                            icon="i-heroicons-arrow-down-tray"
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
