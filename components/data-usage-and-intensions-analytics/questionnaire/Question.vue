<script setup lang="ts">
import { z } from 'zod';

import type { Question } from '~/interfaces/data-usage';
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

const questionTypes: string[] = [QuestionType.TEXT, QuestionType.CHECKBOX, QuestionType.RADIO, QuestionType.DROPDOWN];

//inputs schema
const schema = z.object({
    title: z.string().min(10, { message: 'Title should be at least 10 characters' }),
    type: z.string(),
});

//check if inputs are valid
const isValid = computed(() => {
    return schema.safeParse(props.question).success;
});

watch(isValid, () => {
    emit('isValid', isValid.value);
});

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

const emit = defineEmits(['update:type', 'update:title', 'update:option', 'isValid']);
</script>

<template>
    <div class="w-full">
        <UForm class="flex flex-col space-y-5 w-full" :state="props.question" :schema="schema">
            <UFormGroup :label="$t('data.usage.questionnaire.selectQuestionType')" required name="type">
                <USelectMenu
                    :model-value="question.type"
                    :options="questionTypes"
                    size="md"
                    class="flex w-52"
                    @update:model-value="(value: QuestionType) => emit('update:type', value)"
                />
            </UFormGroup>
            <div v-if="question.type" class="mt-3">
                <div v-if="question.type === QuestionType.TEXT">
                    <UFormGroup :label="$t('title')" required name="title">
                        <UInput
                            :model-value="question.title"
                            :placeholder="$t('data.usage.questionnaire.questionTitle')"
                            @update:model-value="(value: string) => emit('update:title', value)"
                        />
                    </UFormGroup>
                </div>
                <div v-else-if="question.type === QuestionType.CHECKBOX">
                    <h1>Checkbox</h1>
                </div>
                <div v-else-if="question.type === QuestionType.RADIO">
                    <h1>Radio Button</h1>
                </div>
                <div v-else></div>
            </div>
        </UForm>
    </div>
</template>
