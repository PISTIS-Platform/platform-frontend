import { z } from 'zod';

export const CardSchema = z.object({
    name: z.string().min(1, 'Cardholder name is required'),
    number: z.string().length(16, 'Card number must be 16 digits'),
    expiry: z.string().refine((val) => {
        if (!val) return true;
        const digits = val.replace(/\D/g, '');
        if (digits.length < 4) return false;
        const month = parseInt(digits.slice(0, 2));
        return month >= 1 && month <= 12;
    }, 'Enter a valid expiry date'),
    cvv: z.string().min(3, 'CVV must be 3–4 digits').max(4, 'CVV must be 3–4 digits'),
    billingAddress: z.string().min(1, 'Billing address is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    amount: z.string().min(1, 'Amount is required'),
});

export const WithdrawSchema = z.object({
    amount: z.string().min(1, 'Amount is required'),
    iban: z.string().min(1, 'IBAN is required'),
    recipientName: z.string().min(1, 'Recipient name is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    bankAddress: z.string().min(1, 'Bank address is required'),
});

export type CardForm = z.infer<typeof CardSchema>;
export type WithdrawForm = z.infer<typeof WithdrawSchema>;

export const cardDefaults = Object.fromEntries(Object.keys(CardSchema.shape).map((k) => [k, ''])) as CardForm;
export const withdrawDefaults = Object.fromEntries(
    Object.keys(WithdrawSchema.shape).map((k) => [k, '']),
) as WithdrawForm;
