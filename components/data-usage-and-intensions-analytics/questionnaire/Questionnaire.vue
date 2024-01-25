<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();
import type { Question, Questionnaire, QuestionOption } from '~/interfaces/data-usage';

const { isSuccessResponse } = useHttpHelper();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();

const props = defineProps({
    assetId: {
        type: String,
        required: true,
    },
});

const questionnaire = ref<Record<string, string>>({
    title: '',
    description: '',
});

const questionnaireSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, { message: t('required') }),
    description: z.string().trim(),
});

const questions = ref<Question[]>([]);

const addQuestion = () => {
    const newQuestion: Question = {
        id: String(new Date().getTime()),
        type: undefined,
        title: undefined,
        options: [],
        //description: '',
        //allowMultipleSelect: false,
        isValid: false,
    };

    questions.value.push(newQuestion);
};

const removeQuestion = (id?: string) => {
    if (!id) {
        return;
    }

    const indexToRemove = questions.value.findIndex((item: Question) => item.id === id);

    if (indexToRemove !== -1) {
        questions.value.splice(indexToRemove, 1);
    }
};

const applyValidation = ref<boolean>(false);

const saveQuestionnaire = () => {
    applyValidation.value = true;

    if (!questions.value.length) {
        showErrorMessage(t('data.usage.questionnaire.noQuestionsAdded'));
        return;
    }

    //if even at least 1 question has validation errors -> do not proceed
    if (
        questions.value.some((q: Question) => !q.isValid) ||
        !questionnaireSchema.safeParse(questionnaire.value).success
    ) {
        showErrorMessage(t('data.usage.questionnaire.checkInputs'));
        return;
    }

    applyValidation.value = false;

    const questionsBody = questions.value.map((question: Question) => {
        return {
            title: question.title,
            description: '',
            type: question.type,
            options:
                question.options?.map((option: QuestionOption) => {
                    return {
                        text: option.text,
                        description: '',
                    };
                }) || [],
        };
    });

    //TODO:: add inputs for title/description
    const body: Questionnaire = {
        questions: questionsBody,
        title: questionnaire.value.title.trim(),
        description: questionnaire.value.description.trim(),
        creatorId: '1234',
        assetId: props.assetId,
    };

    $fetch(`/api/data-usage/questionnaire/create/${props.assetId}`, {
        method: 'post',
        body,
        onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
                questions.value = [];
                questionnaire.value.title = '';
                questionnaire.value.description = '';
                showSuccessMessage(t('data.usage.questionnaire.saved'));
            } else {
                showErrorMessage(t('data.usage.questionnaire.errorInSave'));
            }
        },
        onResponseError() {
            showErrorMessage(t('data.usage.questionnaire.errorInSave'));
        },
    });
};
const resetQuestionnaire = () => {
    questions.value = [];
};
</script>

<template>
    <Transition
        enter-active-class="duration-300 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
    >
        <UCard>
            <template #header>
                <SubHeading :title="$t('data.usage.questionnaire.build')" />
            </template>
            <div>
                <UForm class="flex flex-col space-y-5" :state="questionnaire" :schema="questionnaireSchema">
                    <!-- Questionnaire title and description-->
                    <UFormGroup :label="$t('data.usage.questionnaire.title')" required name="title" class="w-full">
                        <UInput v-model="questionnaire.title" :placeholder="$t('data.usage.questionnaire.titleInfo')" />
                    </UFormGroup>
                    <UFormGroup :label="$t('data.usage.questionnaire.description')" name="description" class="w-full">
                        <UTextarea
                            v-model="questionnaire.description"
                            :placeholder="$t('data.usage.questionnaire.descriptionInfo')"
                        />
                    </UFormGroup>
                </UForm>
                <div v-if="questions.length" class="flex flex-col space-y-8 mt-8">
                    <div v-for="question in questions" :key="question.id">
                        <UCard :ui="{ base: 'overflow-visible' }">
                            <template #header>
                                <div class="flex justify-start items-center gap-6">
                                    <SubHeading :title="`Question ${questions.indexOf(question) + 1}`" />
                                    <UTooltip text="Remove Question">
                                        <UButton
                                            icon="i-heroicons-trash"
                                            size="xs"
                                            color="primary"
                                            variant="solid"
                                            @click="removeQuestion(question.id)"
                                        />
                                    </UTooltip>
                                </div>
                            </template>
                            <Question
                                :question="question"
                                :apply-validation="applyValidation"
                                @update:title="(value: string) => (question.title = value)"
                                @update:type="(value: string) => (question.type = value)"
                                @update:options="(options: QuestionOption[]) => (question.options = options)"
                                @is-valid="(isValid: boolean) => (question.isValid = isValid)"
                            >
                            </Question>
                        </UCard>
                    </div>
                </div>
                <UTooltip text="Add Question">
                    <UButton
                        icon="i-heroicons-plus"
                        size="xs"
                        color="primary"
                        variant="solid"
                        class="mt-6"
                        @click="addQuestion()"
                    />
                </UTooltip>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-4 justify-between items-center mt-8">
                <UTooltip text="Reset Questionnaire">
                    <UButton size="lg" :label="$t('reset')" color="gray" variant="solid" @click="resetQuestionnaire" />
                </UTooltip>
                <UTooltip text="Save Questionnaire">
                    <UButton size="lg" :label="$t('save')" color="primary" variant="solid" @click="saveQuestionnaire" />
                </UTooltip>
            </div>
        </UCard>
    </Transition>
</template>
