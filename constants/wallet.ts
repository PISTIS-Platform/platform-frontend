import type { Currency, CurrencyInfo, DepositMethodOption, Direction, DirectionOption } from '~/interfaces/wallet';

export const EXCHANGE_FEE = 0;

export const CURRENCY: Record<Currency, CurrencyInfo> = {
    fiat: { label: 'FIAT Money (EUR)', placeholder: '0' },
    coins: { label: 'PISTIS Coins', placeholder: '0', icon: 'i-heroicons-globe-alt' },
};

// Which currency you pay / receive in each direction.
export const SIDES: Record<Direction, { pay: Currency; receive: Currency }> = {
    'cash-in': { pay: 'fiat', receive: 'coins' },
    'cash-out': { pay: 'coins', receive: 'fiat' },
};

export const DIRECTION_OPTIONS: DirectionOption[] = [
    {
        value: 'cash-in',
        icon: 'i-heroicons-banknotes',
        iconClass: 'text-green-600',
        title: 'Buy PISTIS Coins (Cash-In)',
        subtitle: 'Pay FIAT, receive PISTIS Coins',
    },
    {
        value: 'cash-out',
        icon: 'i-heroicons-globe-alt',
        iconClass: 'text-primary-600',
        title: 'Sell PISTIS Coins (Cash-Out)',
        subtitle: 'Pay PISTIS Coins, receive FIAT',
    },
];

export const DEPOSIT_METHODS: DepositMethodOption[] = [
    { value: 'bank', icon: 'i-heroicons-building-library', title: 'Bank Transfer', subtitle: 'SEPA / Wire Transfer' },
    { value: 'card', icon: 'i-heroicons-credit-card', title: 'Credit Card', subtitle: 'Visa, Mastercard' },
];
