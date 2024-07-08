import { z } from 'zod';

export const useMonetizationSchema = () => {
    const { t } = useI18n();
    const isFree = ref(false);

    const oneOffSaleSchema = z
        .object({
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
            terms: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
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
        })
        .required();

    const subscriptionSchema = z
        .object({
            type: z.literal('subscription'),
            frequency: z.string().min(1, t('val.required')),
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
            terms: z.string().min(20, t('val.atLeastNumberChars', { count: 20 })),
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
        })
        .required();

    const investmentSchema = z
        .object({
            type: z.literal('investment'),
            title: z.string().min(10, t('val.atLeastNumberChars', { count: 10 })),
            totalEqPercentage: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
            minEqPercentage: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
            eqPrice: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
            maxNoInvestors: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gt(0, t('val.positive')),
        })
        .required();

    const NFTschema = z
        .object({
            type: z.literal('nft'),
            price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).gte(0, t('val.zeroOrPositive')),
        })
        .required();

    const monetizationSchema = z.union([oneOffSaleSchema, subscriptionSchema, investmentSchema, NFTschema]);

    return {
        isFree,
        monetizationSchema,
    };
};
