import { z } from 'zod';

export const useMonetizationSchema = () => {
    const { t } = useI18n();
    const isFree = ref(false);

    const oneOffSaleSchema = z.object({
        type: z.literal('one-off'),
        price: z.union([
            z
                .string()
                .min(1, { message: t('required') })
                .refine(
                    (val) => {
                        return val.trim().length > 1 && typeof val === 'number' && !Number.isNaN(val);
                    },
                    {
                        message: t('val.validNumber'),
                    },
                ),
            z.coerce.number({ required_error: t('required'), invalid_type_error: t('val.validNumber') }).refine(
                (val) => {
                    return isFree.value ? val === 0 : val >= 10 && val.toString().length > 1;
                },
                {
                    message: isFree.value ? '' : t('data.designer.priceHigherThanTen'),
                },
            ),
        ]),
    });

    const subscriptionSchema = z.object({
        type: z.literal('subscription'),
        subscriptionFrequency: z.string().min(1, t('val.required')),
        price: z.union([
            z
                .string()
                .min(1, { message: t('required') })
                .refine(
                    (val) => {
                        return val.trim().length > 1 && typeof val === 'number' && !Number.isNaN(val);
                    },
                    {
                        message: t('val.validNumber'),
                    },
                ),
            z.coerce.number({ required_error: t('required'), invalid_type_error: t('val.validNumber') }).refine(
                (val) => {
                    return isFree.value ? val === 0 : val >= 10 && val.toString().length > 1;
                },
                {
                    message: isFree.value ? '' : t('data.designer.priceHigherThanTen'),
                },
            ),
        ]),
    });

    const investmentSchema = z.object({
        type: z.literal('investment'),
    });

    const monetizationSchema = z.union([oneOffSaleSchema, subscriptionSchema, investmentSchema]);

    return {
        isFree,
        monetizationSchema,
    };
};
