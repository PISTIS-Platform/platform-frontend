<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { type Question, type QuestionAnswer, type Questionnaire, type SelectedOption } from '~/interfaces/data-usage';

const { t } = useI18n();

const { isSuccessResponse } = useHttpHelper();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();

const props = defineProps({
    questionnaire: {
        type: Object as () => Questionnaire,
        required: true,
        default: null,
    },
});

const answers = ref<QuestionAnswer[]>([]);

const initAnswers = () => {
    answers.value = props.questionnaire.questions.map((question: Question) => {
        return {
            id: String(new Date().getTime()),
            text: '',
            questionType: question.type,
            availableOptions: question?.options || [],
            selectedOptions: [],
            question,
            isValid: question.is_required ? false : true,
        };
    });
};

initAnswers();

const saveAnswers = () => {
    console.log('Submitted Answers.. ');
    answers.value.forEach((a: QuestionAnswer) => {
        console.log({
            isValid: a.isValid,
            text: a.text,
            selectedOptions: a.selectedOptions?.map((o: SelectedOption) => o.label).join(', '),
        });
    });

    // applyValidation.value = true;
    // if even at least 1 answer has validation errors -> do not proceed
    if (answers.value.some((a: QuestionAnswer) => !a.isValid)) {
        showErrorMessage(t('data.usage.questionnaire.checkInputs'));
        return;
    }

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
        questionnaireVersionId: props.questionnaire.latestVersionId,
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
        },
    });
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
                <SubHeading :title="props.questionnaire?.title || ''" :info="props.questionnaire?.description || ''" />
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
                    <UButton size="lg" :label="$t('submit')" color="primary" variant="solid" @click="saveAnswers" />
                </UTooltip>
            </div>
        </UCard>
    </Transition>
</template>
