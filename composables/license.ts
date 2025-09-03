import { useI18n } from 'vue-i18n';
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
            contractTerms: z.string().optional(),
            limitNumber: z
                .union([
                    z
                        .string()
                        .min(1, { message: t('val.required') })
                        .refine(
                            (val) => {
                                return val.trim().length > 0 && !isNaN(Number(val));
                            },
                            {
                                message: t('val.validNumber'),
                            },
                        ),
                    z.coerce
                        .number({ required_error: t('val.required'), invalid_type_error: t('val.validNumber') })
                        .int({ message: t('val.integer') })
                        .gt(0, t('val.positive')),
                ])
                .optional(),
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
                        .min(1, { message: t('val.required') })
                        .refine(
                            (val) => {
                                return val.trim().length > 0 && !isNaN(Number(val));
                            },
                            {
                                message: t('val.validNumber'),
                            },
                        ),
                    z.coerce
                        .number({ required_error: t('val.required'), invalid_type_error: t('val.validNumber') })
                        .int({ message: t('val.integer') })
                        .gt(0, t('val.positive')),
                ])
                .optional(),
            contractBreachDays: z
                .union([
                    z
                        .string()
                        .min(1, { message: t('val.required') })
                        .refine(
                            (val) => {
                                return val.trim().length > 0 && !isNaN(Number(val));
                            },
                            {
                                message: t('val.validNumber'),
                            },
                        ),
                    z.coerce
                        .number({ required_error: t('val.required'), invalid_type_error: t('val.validNumber') })
                        .int({ message: t('val.integer') })
                        .gt(0, t('val.positive')),
                ])
                .optional(),
            personalDataTerms: z.string().optional(),
        })
        .superRefine((data, ctx) => {
            if (data.license === 'PISTIS License') {
                if (!data.contractTerms) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['contractTerms'],
                        message: t('val.required'),
                    });
                }
                if (!data.nonRenewalDays) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['nonRenewalDays'],
                        message: t('val.positive'),
                    });
                }
                if (!data.contractBreachDays) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['contractBreachDays'],
                        message: t('val.positive'),
                    });
                }

                if (!data.region?.length && !isWorldwide.value) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['region'],
                        message: t('val.required'),
                    });
                }
                if (!data.transferable) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['transferable'],
                        message: t('val.required'),
                    });
                }
                if (!data.termDate && !isPerpetual.value) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['termDate'],
                        message: t('val.required'),
                    });
                }
                if (!data.personalDataTerms && hasPersonalData.value) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['personalDataTerms'],
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
