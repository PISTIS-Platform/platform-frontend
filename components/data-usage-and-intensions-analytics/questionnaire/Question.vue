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
    applyValidation: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const questionTypes = [QuestionType.TEXT, QuestionType.CHECKBOX, QuestionType.RADIO, QuestionType.DROPDOWN] as const;
const questionTypesEnum = z.enum(questionTypes);

// Schema for all the inputs
const schema = z.object({
    title: z
        .string()
        .trim()
        .min(10, { message: t('data.usage.questionnaire.titleMinLength') }),
    type: questionTypesEnum,
    options: z.array(
        z.object({
            text: z
                .string({ required_error: t('data.usage.questionnaire.optionTextRequired') })
                .trim()
                .min(1, { message: t('data.usage.questionnaire.optionTextRequired') }),
        }),
    ),
    //TODO:: uncomment this and add conditional check
    //TODO:: check issue with validation error remaining on 'clean' option text when a previous deleted one had error
    // .min(2, { message: t('data.usage.questionnaire.optionsMinLength') }),
});

//check if inputs are valid
const isValid = computed(() => {
    console.log(schema.safeParse(props.question));
    return schema.safeParse(props.question).success;
});

//TODO:: check if watched can be avoided
watch(isValid, () => {
    emit('isValid', isValid.value);
});

//TODO:: trigger validation upon clicking 'Save' btn in Questionnaire
// const questionForm = ref<Form<any>>();

// watch(props.applyValidation, () => {
//     validateForm();
// });

// const formRef = ref<Form<any>>();

// async function validateForm() {
//     if (!formRef.value) {
//         return;
//     }

//     return await formRef.value.validate(); // Throws validation errors if state is invalid
// }

const questionOptions = ref<QuestionOption[]>([]);
const userRemovedOptions = ref<boolean>(false);

const updateOptionText = (id: string, text: string) => {
    let option = questionOptions.value.find((item: QuestionOption) => item.id === id);

    if (!option) {
        return;
    }

    option.text = text;

    emit('update:options', questionOptions.value);
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

const emit = defineEmits(['update:type', 'update:title', 'update:options', 'isValid']);
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
                        @update:model-value="(value: QuestionType) => emit('update:type', value)"
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
                            <UTooltip text="Remove Option">
                                <UButton
                                    icon="i-heroicons-trash"
                                    size="sm"
                                    color="primary"
                                    variant="ghost"
                                    @click="removeQuestionOption(option.id)"
                                />
                            </UTooltip>
                        </div>

                        <!-- Button for adding new option -->
                        <UTooltip text="Add Option">
                            <UButton
                                icon="i-heroicons-plus-circle-20-solid"
                                size="sm"
                                color="primary"
                                variant="ghost"
                                @click="addQuestionOption()"
                            />
                        </UTooltip>
                    </div>
                </div>
            </div>
        </UForm>
    </div>
</template>
