export type Direction = 'cash-in' | 'cash-out';
export type Currency = 'fiat' | 'coins';
export type DepositMethod = 'bank' | 'card';

export interface CurrencyInfo {
    label: string;
    placeholder: string;
    icon?: string;
}

export interface DirectionOption {
    value: Direction;
    icon: string;
    iconClass: string;
    title: string;
    subtitle: string;
}

export interface DepositMethodOption {
    value: DepositMethod;
    icon: string;
    title: string;
    subtitle: string;
}
