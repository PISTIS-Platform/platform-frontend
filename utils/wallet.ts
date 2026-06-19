import type { ZodType } from 'zod';

import { EXCHANGE_RATE } from '~/constants/wallet';
import type { Direction } from '~/interfaces/wallet';

// Parse a balance into a number, or undefined when it isn't a valid number.
export const parseAmount = (value?: string | number | null): number | undefined => {
    const num = typeof value === 'number' ? value : parseFloat(value ?? '');
    return isNaN(num) ? undefined : num;
};

// Keep only digits and a single decimal point.
export const sanitizeDecimal = (val: string | number): string => {
    let sanitized = String(val ?? '').replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) sanitized = `${parts[0]}.${parts.slice(1).join('')}`;
    return sanitized;
};

// Convert the amount the user pays into the amount they receive for a direction.
export const convertAmount = (payAmount: string, direction: Direction): string => {
    const num = parseFloat(payAmount);
    if (payAmount === '' || isNaN(num)) return '';
    return (direction === 'cash-in' ? num / EXCHANGE_RATE : num * EXCHANGE_RATE).toFixed(2);
};

// Returns an error message for an amount field, or null when valid.
export const amountError = (
    raw: string,
    opts: { min?: number; max?: number; tooSmall: string; tooLarge: string },
): string | null => {
    if (raw === '') return null;
    const num = parseFloat(raw);
    if (isNaN(num) || num <= 0 || num < (opts.min ?? 0)) return opts.tooSmall;
    if (opts.max !== undefined && num > opts.max) return opts.tooLarge;
    return null;
};

// Validate a single form field against a Zod schema and sync its error message.
export const makeFieldValidator =
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

// Validate the whole form, populating every field error. Returns true when valid.
export const makeFormValidator =
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

// Reset a form to its defaults, clear its errors, then run a close callback.
export const makeCancel =
    <T extends object>(form: T, defaults: T, errors: Partial<Record<keyof T, string>>, close: () => void) =>
    () => {
        Object.assign(form, { ...defaults });
        (Object.keys(errors) as (keyof T)[]).forEach((k) => delete errors[k]);
        close();
    };
