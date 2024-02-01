<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();

import type { Question, QuestionOption } from '~/interfaces/data-usage';
import { QuestionType } from '~/interfaces/data-usage';

const props = defineProps({
    question: {
        type: Object as () => Question,
        required: true,
    },
});

const questionTypes = [QuestionType.TEXT, QuestionType.CHECKBOX, QuestionType.RADIO] as const;
const questionTypesEnum = z.enum(questionTypes);

const maxCharactersTextLimit = 255;

// Schema for all the inputs
const schema = z.object({
    title: z
        .string()
        .trim()
        .min(1, { message: t('required') })
        .max(maxCharactersTextLimit, {
            message: t('val.moreThanNumberChars', { count: maxCharactersTextLimit }),
        }),
    type: questionTypesEnum,
    options: z
        .array(
            z.object({
                text: z
                    .string({ required_error: t('data.usage.questionnaire.optionTextRequired') })
                    .trim()
                    .min(1, { message: t('data.usage.questionnaire.optionTextRequired') })
                    .max(maxCharactersTextLimit, {
                        message: t('val.moreThanNumberChars', { count: maxCharactersTextLimit }),
                    }),
            }),
        )
        .refine(
            (options) => {
                if (options.length < 2 && props.question.type !== QuestionType.TEXT) {
                    return false;
                }

                return true;
            },
            {
                message: t('data.usage.questionnaire.optionsMinLength'),
            },
        ),
});

//check if inputs are valid
const isValid = computed(() => {
    return schema.safeParse(props.question).success;
});

watch(isValid, () => {
    emit('isValid', isValid.value);
});

const questionOptions = ref<QuestionOption[]>(props.question?.options || []);
const userRemovedOptions = ref<boolean>(false);

const updateOptionText = (id: string, text: string) => {
    let option = questionOptions.value.find((item: QuestionOption) => item.id === id);

    if (!option) {
        return;
    }

    option.text = text;

    emit('update:options', questionOptions.value);
};

const updateQuestionType = (type: QuestionType) => {
    if (type === QuestionType.TEXT) {
        questionOptions.value = [];
        emit('update:options', questionOptions.value);
    }

    emit('update:type', type);
};

const addQuestionOption = () => {
    const newOption: QuestionOption = {
        id: String(new Date().getTime()),
        text: undefined,
        description: undefined,
    };

    questionOptions.value.push(newOption);

    emit('update:options', questionOptions.value);
};

const removeQuestionOption = (id: string) => {
    const indexToRemove = questionOptions.value.findIndex((item: QuestionOption) => item.id === id);

    if (indexToRemove !== -1) {
        questionOptions.value.splice(indexToRemove, 1);
        userRemovedOptions.value = true;

        emit('update:options', questionOptions.value);
    }
};

const preparedOptions = [
    [
        {
            label: t('data.usage.questionnaire.numberingOptions1to5'),
            options: ['1', '2', '3', '4', '5'],
        },
    ],
    [
        {
            label: t('data.usage.questionnaire.scaleTextOptions'),
            options: [
                t('data.usage.questionnaire.scaleTextExtremelyPoor'),
                t('data.usage.questionnaire.scaleTextPoor'),
                t('data.usage.questionnaire.scaleTextNeutral'),
                t('data.usage.questionnaire.scaleTextGreat'),
                t('data.usage.questionnaire.scaleTextExcellent'),
            ],
        },
    ],
];

const addPreConfiguredOptions = (configuredOptions: string[]) => {
    questionOptions.value = [];

    configuredOptions.forEach((configuredOptionText: string, index: number) => {
        questionOptions.value.push({
            id: String(new Date().getTime()) + index.toString(),
            text: configuredOptionText,
            description: undefined,
        });
    });

    emit('update:options', questionOptions.value);
};

const emit = defineEmits(['update:type', 'update:title', 'update:is_required', 'update:options', 'isValid']);
</script>

<template>
    <div class="w-full">
        <UForm class="flex flex-col space-y-5 w-full" :state="props.question" :schema="schema">
            <!-- Select Menu -->

            <div class="flex justify-start items-start gap-8 w-full">
                <UFormGroup :label="$t('data.usage.questionnaire.selectQuestionType')" required name="type">
                    <USelectMenu
                        :model-value="question.type"
                        :options="questionTypesEnum.options"
                        size="md"
                        class="flex w-64"
                        @update:model-value="(value: QuestionType) => updateQuestionType(value)"
                    />
                </UFormGroup>
                <!-- Question title -->
                <UFormGroup v-if="question.type" :label="$t('title')" required name="title" class="w-full">
                    <UInput
                        :model-value="question.title"
                        :placeholder="$t('data.usage.questionnaire.questionTitle')"
                        class="w-full flex-1"
                        @update:model-value="(value: string) => emit('update:title', value)"
                    />
                </UFormGroup>
            </div>

            <!-- Display Content for Checkboxes and radio buttons -->
            <div v-if="question.type === QuestionType.CHECKBOX || question.type === QuestionType.RADIO" class="mt-3">
                <div class="flex flex-col justify-start items-start">
                    <!-- General form group for options -->
                    <UFormGroup
                        :label="$t('data.usage.questionnaire.options')"
                        :error="questionOptions.length < 2"
                        required
                    >
                        <template #error="{ error }">
                            <div
                                :class="[
                                    !error ? 'hidden' : error && userRemovedOptions ? 'text-red-500' : 'text-gray-500',
                                    'mb-2',
                                ]"
                            >
                                {{ $t('data.usage.questionnaire.optionsMinLength') }}
                            </div>
                        </template>
                    </UFormGroup>

                    <!-- Looping through added question options -->
                    <div class="flex flex-col items-start justify-start w-full space-y-4">
                        <div
                            v-for="(option, index) in questionOptions"
                            :key="option.id"
                            class="flex gap-2 justify-start items-start"
                        >
                            <!-- Input for option text -->
                            <UFormGroup required :name="`options.${index}.text`">
                                <UInput
                                    :model-value="option.text"
                                    :placeholder="$t('data.usage.questionnaire.optionText')"
                                    class="w-64"
                                    @update:model-value="(value: string) => updateOptionText(option.id, value)"
                                />
                            </UFormGroup>

                            <!-- Button for removing option -->
                            <UTooltip :text="$t('data.usage.questionnaire.removeOption')">
                                <UButton
                                    icon="i-heroicons-trash"
                                    size="sm"
                                    color="primary"
                                    variant="ghost"
                                    @click="removeQuestionOption(option.id)"
                                />
                            </UTooltip>
                        </div>

                        <div class="flex gap-4 justify-start items-center">
                            <!-- Button for adding new option -->
                            <UTooltip :text="$t('data.usage.questionnaire.addCustomOption')">
                                <UButton
                                    icon="i-heroicons-plus-circle-20-solid"
                                    size="md"
                                    color="primary"
                                    variant="ghost"
                                    @click="addQuestionOption()"
                                />
                            </UTooltip>
                            <UDropdown
                                :items="preparedOptions"
                                mode="hover"
                                :popper="{ placement: 'bottom-start' }"
                                :ui="{
                                    width: 'w-80',
                                    item: {
                                        size: 'text-xs',
                                        base: 'flex justify-start items-start',
                                        padding: 'p-1',
                                    },
                                }"
                            >
                                <UButton
                                    color="primary"
                                    variant="outline"
                                    icon="i-heroicons-list-bullet-20-solid"
                                    :label="$t('data.usage.questionnaire.addPreconfiguredOptions')"
                                />
                                <template #item="{ item }">
                                    <div
                                        class="flex justify-start w-full"
                                        @click="addPreConfiguredOptions(item.options)"
                                    >
                                        {{ item.label }}
                                    </div>
                                </template>
                            </UDropdown>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex mt-8">
                <UFormGroup name="is_required">
                    <UCheckbox
                        :model-value="question.is_required"
                        :label="$t('data.usage.questionnaire.is_required')"
                        @update:model-value="(value: boolean) => emit('update:is_required', value)"
                    />
                </UFormGroup>
            </div>
        </UForm>
    </div>
</template>
