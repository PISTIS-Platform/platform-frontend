import * as R from 'ramda';
import { z } from 'zod';

import { durations, LicenseCode } from '~/constants/licenses';

export const useLicenseSchema = (monetizationDetailsRef: Ref) => {
    const isFree = computed(() => monetizationDetailsRef?.value?.price === 0);
    const isOneOff = computed(() => monetizationDetailsRef?.value?.type === 'one-off');

    const { t } = useI18n();
    const isWorldwide = ref(false);
    const hasPersonalData = ref(false);
    const durationSelections = [
        {
            value: durations.ONE_MONTH,
            label: t('data.designer.duration.oneMonth'),
        },
        {
            value: durations.THREE_MONTHS,
            label: t('data.designer.duration.threeMonths'),
        },
        {
            value: durations.SIX_MONTHS,
            label: t('data.designer.duration.sixMonths'),
        },
        {
            value: durations.ONE_YEAR,
            label: t('data.designer.duration.oneYear'),
        },
        {
            value: durations.PERPETUAL,
            label: t('data.designer.duration.perpetual'),
        },
        {
            value: durations.PERPETUAL_REVOCABLE,
            label: t('data.designer.duration.perpetualRevocable'),
        },
    ];

    const licenseSchema = z
        .object({
            license: z.string().min(1, t('val.required')),
            extraTerms: z.string().optional(),
            contractTerms: z.string().min(1, t('val.required')),
            isExclusive: z.boolean().optional(),
            region: z.string().array().optional(),
            transferable: z.string().optional(),
            duration: z.union([z.string(), z.number()]).optional(),
            noUseWithBlacklistedDatasets: z.boolean().optional(),
            additionalRenewalTerms: z.string().optional(),
            numOfResell: z
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
                        .int({ message: t('val.integer') }),
                ])
                .optional(),
            numOfShare: z
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
                        .int({ message: t('val.integer') }),
                ])
                .optional(),
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
            if (data.license === LicenseCode.PISTIS) {
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

                if (!data.duration) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                    });
                }

                if (isFree.value && isOneOff.value && R.isNil(data.numOfShare)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                        path: ['numOfShare'],
                    });
                }

                if (!isFree.value && isOneOff.value && R.isNil(data.numOfResell)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('val.required'),
                        path: ['numOfResell'],
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
        hasPersonalData,
        licenseSchema,
        durationSelections,
    };
};
