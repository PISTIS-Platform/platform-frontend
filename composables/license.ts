import { z } from 'zod';

export const useLicenseSchema = () => {
    const { t } = useI18n();
    const isWorldwide = ref(false);
    const isPerpetual = ref(false);
    const hasPersonalData = ref(false);

    const licenseSchema = z
        .object({
            license: z.string().min(1, t('val.required')),
            extraTerms: z.string().optional(),
            contractTerms: z.string().min(1, t('val.required')),
            limitNumber: z.union([
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
                z.coerce
                    .number({ required_error: t('required'), invalid_type_error: t('val.validNumber') })
                    .gte(0, t('val.positive'))
                    .int({ message: t('val.integer') })
                    .refine(
                        (val) => {
                            return val > 0;
                        },
                        {
                            message: t('val.positive'),
                        },
                    ),
            ]),
            limitFrequency: z.string().min(1, t('val.required')),
            isExclusive: z.boolean().optional(),
            region: z.string().array().optional(),
            transferable: z.string().optional(),
            termDate: z.string().optional(),
            additionalRenewalTerms: z.string().optional(),
            nonRenewalDays: z
                .union([
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
                    z.coerce
                        .number({ required_error: t('required'), invalid_type_error: t('val.validNumber') })
                        .gte(0, t('val.positive'))
                        .int({ message: t('val.integer') })
                        .refine(
                            (val) => {
                                return val > 0;
                            },
                            {
                                message: t('val.positive'),
                            },
                        ),
                ])
                .optional(),
            contractBreachDays: z
                .union([
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
                    z.coerce
                        .number({ required_error: t('required'), invalid_type_error: t('val.validNumber') })
                        .gte(0, t('val.positive'))
                        .int({ message: t('val.integer') })
                        .refine(
                            (val) => {
                                return val > 0;
                            },
                            {
                                message: t('val.positive'),
                            },
                        ),
                ])
                .optional(),
            personalDataTerms: z.string().optional(),
        })
        .superRefine((data, ctx) => {
            if (data.license === 'PISTIS License') {
                if (!data.region?.length && !isWorldwide.value) {
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
                        message: t('val.positive'),
                    });
                }

                if (!data.contractBreachDays) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.positive'),
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

    return {
        isWorldwide,
        isPerpetual,
        hasPersonalData,
        licenseSchema,
    };
};
