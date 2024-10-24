import { z } from 'zod';

export const useMonetizationSchema = () => {
    const { t } = useI18n();
    const isFree = ref(false);
    const isWorldwide = ref(false);
    const isPerpetual = ref(false);
    const hasPersonalData = ref(false);

    const oneOffSaleSchema = z
        .object({
            type: z.literal('one-off'),
            price: z.number({ invalid_type_error: t('val.validNumber') }).refine(
                (val) => {
                    return isFree.value ? val === 0 : val > 0;
                },
                {
                    message: isFree.value ? '' : t('data.designer.priceHigherThanZero'),
                },
            ),
            license: z.string().min(1, t('val.required')),
            extraTerms: z.string().optional(),
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
            limitFrequency: z.string(),
            isExclusive: z.boolean().optional(),
            region: z.string().optional(),
            transferable: z.string().optional(),
            termDate: z.string().optional(),
            additionalRenewalTerms: z.string().optional(),
            nonRenewalDays: z.coerce
                .number({ invalid_type_error: t('val.validNumber') })
                .gte(0, t('val.zeroOrPositive'))
                .optional(),
            contractBreachDays: z.coerce
                .number({ invalid_type_error: t('val.validNumber') })
                .gte(0, t('val.zeroOrPositive'))
                .optional(),
            personalDataTerms: z.string().optional(),
        })
        .superRefine((data, ctx) => {
            if (data.license === 'PISTIS License') {
                if (!data.region && !isWorldwide.value) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.transferable) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.termDate && !isPerpetual.value) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.nonRenewalDays) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.contractBreachDays) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.personalDataTerms && hasPersonalData.value) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }
            }
        });

    const subscriptionSchema = z
        .object({
            type: z.literal('subscription'),
            subscriptionFrequency: z.string().min(1, t('val.required')),
            price: z.coerce.number({ invalid_type_error: t('val.validNumber') }).refine(
                (val) => {
                    return isFree.value ? val === 0 : val > 0;
                },
                {
                    message: isFree.value ? '' : t('data.designer.priceHigherThanZero'),
                },
            ),
            license: z.string().min(1, t('val.required')),
            extraTerms: z.string().optional(),
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
            region: z.string().optional(),
            transferable: z.string().optional(),
            termDate: z.string().optional(),
            additionalRenewalTerms: z.string().optional(),
            nonRenewalDays: z.coerce
                .number({ invalid_type_error: t('val.validNumber') })
                .gte(0, t('val.zeroOrPositive'))
                .optional(),
            contractBreachDays: z.coerce
                .number({ invalid_type_error: t('val.validNumber') })
                .gte(0, t('val.zeroOrPositive'))
                .optional(),
            personalDataTerms: z.string().optional(),
        })
        .superRefine((data, ctx) => {
            if (data.license === 'PISTIS License') {
                if (!data.region && !isWorldwide.value) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.transferable) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.termDate && !isPerpetual.value) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.nonRenewalDays) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.contractBreachDays) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (!data.personalDataTerms && hasPersonalData.value) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }
            }
        });

    const monetizationSchema = z.union([oneOffSaleSchema, subscriptionSchema]);

    return {
        isFree,
        isWorldwide,
        isPerpetual,
        hasPersonalData,
        monetizationSchema,
    };
};
