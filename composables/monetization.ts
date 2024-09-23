import { z } from 'zod';

export const useMonetizationSchema = () => {
    const { t } = useI18n();
    const isFree = ref(false);
    const isWorldwide = ref(false);
    const isPerpetual = ref(false);

    const oneOffSaleSchema = z.object({
        type: z.literal('one-off'),
        price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).refine(
            (val) => {
                return isFree.value ? val === 0 : val > 0;
            },
            {
                message: isFree.value ? '' : t('data.designer.priceHigherThanZero'),
            },
        ),
        license: z.string().min(1, t('val.required')),
        extraTerms: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
        contractTerms: z.string().min(1, t('val.required')),
        limitNumber: z.coerce
            .number({ invalid_type_error: t('val.validNumber') })
            .gte(0, t('val.zeroOrPositive'))
            .refine(
                (val) => {
                    return val > 0;
                },
                {
                    message: t('val.zeroOrPositive'),
                },
            ),
        limitFrequency: z.string().min(1, t('val.required')),
        isExclusive: z.boolean().optional(),
        region: z
            .string()
            .optional()
            .refine(
                (val) => {
                    return isWorldwide.value ? true : val && val.length;
                },
                {
                    message: isWorldwide.value ? '' : t('val.required'),
                },
            ),
        transferable: z.string().min(1, t('val.required')),
    });

    const subscriptionSchema = z.object({
        type: z.literal('subscription'),
        subscriptionFrequency: z.string().min(1, t('val.required')),
        // price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.zeroOrPositive')),
        price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).refine(
            (val) => {
                return isFree.value ? val === 0 : val > 0;
            },
            {
                message: isFree.value ? '' : t('data.designer.priceHigherThanZero'),
            },
        ),
        license: z.string().min(1, t('val.required')),
        extraTerms: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
        contractTerms: z.string().min(1, t('val.required')),
        limitNumber: z.coerce
            .number({ invalid_type_error: t('val.validNumber') })
            .gte(0, t('val.zeroOrPositive'))
            .refine(
                (val) => {
                    return val > 0;
                },
                {
                    message: t('val.zeroOrPositive'),
                },
            ),
        limitFrequency: z.string().min(1, t('val.required')),
        isExclusive: z.boolean().optional(),
        region: z
            .string()
            .optional()
            .refine(
                (val) => {
                    return isWorldwide.value ? true : val && val.length;
                },
                {
                    message: isWorldwide.value ? '' : t('val.required'),
                },
            ),
        transferable: z.string().min(1, t('val.required')),
    });

    const monetizationSchema = z.union([oneOffSaleSchema, subscriptionSchema]);

    return {
        isFree,
        isWorldwide,
        isPerpetual,
        monetizationSchema,
    };
};
