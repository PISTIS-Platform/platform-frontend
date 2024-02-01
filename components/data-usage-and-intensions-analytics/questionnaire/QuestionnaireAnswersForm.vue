<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import {
    type Question,
    type QuestionAnswer,
    type QuestionnaireVersion,
    type SelectedOption,
} from '~/interfaces/data-usage';

const { t } = useI18n();

const { isSuccessResponse } = useHttpHelper();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();

const loadingQuestionnaireVersion = ref<boolean>(true);
const questionnaireVersion = ref<QuestionnaireVersion>();

onMounted(async () => {
    const { data, pending, error } = await useFetch('/api/data-usage/questionnaire/active-version', {
        query: { for_verified_buyers: true },
    });

    if (error.value) {
        showErrorMessage(t('data.usage.questionnaire.errorWhileRetrievingActiveVersion'));
        return;
    }

    questionnaireVersion.value = data.value as QuestionnaireVersion;
    loadingQuestionnaireVersion.value = pending.value;

    if (questionnaireVersion.value) {
        initAnswers();
    }
});

const answers = ref<QuestionAnswer[]>([]);

const initAnswers = () => {
    answers.value =
        questionnaireVersion.value?.questions.map((question: Question) => {
            return {
                id: String(new Date().getTime()),
                text: '',
                questionType: question.type,
                availableOptions: question?.options || [],
                selectedOptions: [],
                question,
                isValid: question.is_required ? false : true,
            };
        }) || [];
};

const saveAnswers = () => {
    // if even at least 1 answer has validation errors -> do not proceed
    if (answers.value.some((a: QuestionAnswer) => !a.isValid)) {
        showErrorMessage(t('data.usage.questionnaire.checkInputs'));
        return;
    }

    shouldDisableSubmitButton.value = true;

    interface Answer {
        questionId: string;
        text?: string | null;
        optionId?: string | null;
    }

    interface AnswersBody {
        answers: Answer[];
        userId: string;
        questionnaireVersionId: string | undefined;
    }

    let preparedAnswers: Answer[] = [];

    answers.value.forEach((answer: QuestionAnswer) => {
        let obj: Answer = {
            questionId: answer.question?.id || '',
        };

        if (answer.text) {
            obj['text'] = answer.text;
            preparedAnswers.push(obj);
        } else {
            answer.selectedOptions?.forEach((option: SelectedOption) => {
                let optionObj: Answer = {
                    questionId: answer.question?.id || '',
                    optionId: option.id,
                };

                preparedAnswers.push(optionObj);
            });
        }

        return obj;
    });

    let answersBody: AnswersBody = {
        answers: preparedAnswers,
        userId: '789', //TODO:: replace with real user
        questionnaireVersionId: questionnaireVersion.value?.id || '',
    };

    $fetch(`/api/data-usage/questionnaire/answers`, {
        method: 'post',
        body: answersBody,
        onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
                showSuccessMessage(t('data.usage.questionnaire.savedAnswers'));
            }
        },
        onResponseError() {
            showErrorMessage(t('data.usage.questionnaire.errorInSave'));
            shouldDisableSubmitButton.value = false;
        },
    });
};

const shouldDisableSubmitButton = ref<boolean>(false);

const isSubmitDisabled = computed(() => {
    if (answers.value.some((a: QuestionAnswer) => !a.isValid) || shouldDisableSubmitButton.value) {
        return true;
    }

    return false;
});
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
        <div v-if="loadingQuestionnaireVersion">
            <UProgress animation="carousel" />
        </div>
        <div
            v-else-if="!loadingQuestionnaireVersion && !questionnaireVersion"
            class="flex w-full h-96 justify-center items-center"
        >
            <span>{{ $t('data.usage.questionnaire.noActiveQuestionnaireFound') }} </span>
        </div>
        <UCard v-else>
            <template #header>
                <SubHeading
                    :title="questionnaireVersion?.title || ''"
                    :info="questionnaireVersion?.description || ''"
                />
            </template>

            <!-- Questionnaire Answers -->
            <div class="flex flex-col space-y-8">
                <div v-for="answer in answers" :key="answer.id">
                    <UCard :ui="{ base: 'overflow-visible' }">
                        <template #header>
                            <div class="flex justify-start items-center gap-1">
                                <SubHeading
                                    :title="answer.question?.title || ''"
                                    :info="answer.question?.description || ''"
                                />
                                <div v-if="answer.question?.is_required" class="text-red-500 text-sm">*</div>
                            </div>
                        </template>
                        <Answer
                            :answer="answer"
                            @update:text="(value: string) => (answer.text = value)"
                            @update:selected-options="(value: SelectedOption[]) => (answer.selectedOptions = value)"
                            @is-valid="(isValid: boolean) => (answer.isValid = isValid)"
                        />
                    </UCard>
                </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-4 justify-between items-center mt-8">
                <UTooltip text="Save Questionnaire">
                    <UButton
                        size="lg"
                        :label="$t('submit')"
                        color="primary"
                        variant="solid"
                        :disabled="isSubmitDisabled"
                        @click="saveAnswers"
                    />
                </UTooltip>
            </div>
        </UCard>
    </Transition>
</template>
