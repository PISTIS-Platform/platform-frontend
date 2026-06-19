<script setup lang="ts">
import { DEPOSIT_METHODS } from '~/constants/wallet';
import { cardDefaults, type CardForm, CardSchema } from '~/schemas/user-wallet';
import { makeCancel, makeFieldValidator } from '~/utils/wallet';

defineProps<{ factoryIban: string }>();
const emit = defineEmits<{ close: [] }>();

const depositMethod = ref<'bank' | 'card'>('bank');
const cardForm = reactive<CardForm>({ ...cardDefaults });
const cardErrors = reactive<Partial<Record<keyof CardForm, string>>>({});

const validateCardField = makeFieldValidator(CardSchema, cardForm, cardErrors);
const cancel = makeCancel(cardForm, cardDefaults, cardErrors, () => emit('close'));

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
</script>

<template>
    <div class="flex flex-col gap-4">
        <p class="text-sm text-gray-600">Choose your preferred deposit method:</p>

        <!-- Method selection -->
        <div class="flex gap-4">
            <button
                v-for="method in DEPOSIT_METHODS"
                :key="method.value"
                class="flex-1 min-w-0 flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors duration-150"
                :class="
                    depositMethod === method.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-primary-300'
                "
                @click="depositMethod = method.value"
            >
                <div
                    class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                    :class="depositMethod === method.value ? 'border-primary-500' : 'border-gray-400'"
                >
                    <div v-if="depositMethod === method.value" class="w-2 h-2 rounded-full bg-primary-500" />
                </div>
                <UIcon :name="method.icon" class="w-5 h-5 text-gray-600" />
                <div class="text-left">
                    <div class="font-semibold text-gray-800 text-sm">{{ method.title }}</div>
                    <div class="text-xs text-gray-500">{{ method.subtitle }}</div>
                </div>
            </button>
        </div>

        <!-- Bank Transfer details -->
        <div v-if="depositMethod === 'bank'" class="flex flex-col gap-3">
            <div class="rounded-lg border border-dashed border-primary-300 bg-primary-50 px-5 py-4">
                <p class="text-xs font-semibold text-primary-500 tracking-wide uppercase mb-1">PISTIS Platform IBAN</p>
                <p class="text-xl font-bold text-gray-900 tracking-wider">{{ factoryIban }}</p>
            </div>
        </div>

        <!-- Credit Card details -->
        <div v-else-if="depositMethod === 'card'" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Cardholder Name</label>
                <UInput
                    v-model="cardForm.name"
                    size="lg"
                    placeholder="Cardholder name"
                    @update:model-value="() => validateCardField('name')"
                />
                <p v-if="cardErrors.name" class="text-xs text-red-500">{{ cardErrors.name }}</p>
            </div>

            <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Card Number</label>
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
                    <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Expiry Date</label>
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
                    <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">CVV / CVC</label>
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
                    <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Billing Address</label>
                    <UInput
                        v-model="cardForm.billingAddress"
                        size="lg"
                        placeholder="Street, City"
                        @update:model-value="() => validateCardField('billingAddress')"
                    />
                    <p v-if="cardErrors.billingAddress" class="text-xs text-red-500">{{ cardErrors.billingAddress }}</p>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Postal Code</label>
                    <UInput
                        v-model="cardForm.postalCode"
                        size="lg"
                        placeholder="12345"
                        @update:model-value="() => validateCardField('postalCode')"
                    />
                    <p v-if="cardErrors.postalCode" class="text-xs text-red-500">{{ cardErrors.postalCode }}</p>
                </div>
            </div>
        </div>

        <div v-if="depositMethod === 'card'" class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 tracking-wide uppercase">Amount to Deposit (PSTC)</label>
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
            <UButton color="primary" variant="solid" icon="i-heroicons-lock-closed">Confirm Deposit</UButton>
            <UButton color="white" variant="solid" @click="cancel">Cancel</UButton>
        </div>

        <p v-if="depositMethod === 'card'" class="text-xs text-gray-500 flex items-center gap-1">
            <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 shrink-0" />
            Your card data is encrypted and handled securely. PISTIS does not store card details.
        </p>
    </div>
</template>
