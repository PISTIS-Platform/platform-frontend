<script setup lang="ts">
import { Question, QuestionAnswer, Questionnaire, QuestionOption, SelectedOption } from '~/interfaces/usage-analytics';

const { t } = useI18n();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();
const route = useRoute();

const answers = ref<QuestionAnswer[]>([]);
const errorMsg = ref('');
const submitPending = ref<boolean>(false);

const {
    data: questionnaire,
    pending: loadingQuestionnaire,
    error,
} = await useAsyncData<Questionnaire>(`fetchQuestionnaire-asset-${route.params.assetId}`, () =>
    $fetch(`/api/usage-analytics/${route.params.assetId}`),
);

if (error.value || !questionnaire.value) {
    //TODO:: check if errorMsg (for when user has already answered the questionnaire) should be filled
    // if (error.value?.statusCode === 400) {
    //     errorMsg.value = error.value.message;
    // }
    showErrorMessage(t('usageAnalytics.errorInRetrievingQuestionnaire'));
} else {
    let answerId = 0;

    answers.value =
        questionnaire.value?.questions?.map((question: Question) => {
            let availableOptions: SelectedOption[] = [];

            if (question?.options) {
                let id = 0;
                availableOptions = question?.options.map((option: QuestionOption) => {
                    id++;

                    return {
                        id: id.toString(),
                        value: option?.text || '',
                        isSelected: false,
                    };
                });
            }

            answerId++;

            return {
                id: answerId.toString(),
                text: '',
                questionType: question.type,
                availableOptions,
                selectedOptions: [],
                question,
                isValid: question.isRequired ? false : true,
            };
        }) || [];
}

const isSubmitDisabled = computed(() => {
    if (answers.value.some((a: QuestionAnswer) => !a.isValid) || submitPending.value) {
        return true;
    }

    return false;
});

const saveAnswers = async () => {
    // if even at least 1 answer has validation errors -> do not proceed
    if (answers.value.some((a: QuestionAnswer) => !a.isValid)) {
        showErrorMessage(t('usageAnalytics.checkInputs'));
        return;
    }

    if (!questionnaire.value) {
        return;
    }

    submitPending.value = true;

    let body: {
        assetId: string;
        responses: {
            questionId: string;
            questionTitle: string;
            text: string | null;
            options: string[] | null;
        }[];
    } = {
        assetId: route.params.id as string,
        responses: [],
    };

    answers.value.forEach((answer: QuestionAnswer) => {
        body.responses.push({
            questionId: answer.question?.id || '',
            questionTitle: answer.question?.title || '',
            text: answer?.text || null,
            options: answer.selectedOptions?.map((option: SelectedOption) => option.value) || null,
        });
    });

    try {
        await $fetch(`/api/usage-analytics/submit-answers`, {
            query: {
                id: questionnaire.value?.id,
                version: questionnaire.value?.version,
            },
            method: 'post',
            body,
        });

        showSuccessMessage(t('usageAnalytics.savedAnswers'));

        //TODO:: add any navigation after success
    } catch (error) {
        showErrorMessage(t('usageAnalytics.errorInSubmitAnswers'));
        submitPending.value = false;
    }
};
</script>

<template>
    <div class="mx-auto px-8 max-w-7xl w-full mt-4">
        <div v-if="loadingQuestionnaire">
            <UProgress animation="carousel" />
        </div>
        <div v-else-if="!loadingQuestionnaire && error" class="flex w-full h-96 justify-center items-center">
            <span v-if="errorMsg">{{ $t('usageAnalytics.questionnaireAlreadyAnswered') }} </span>
        </div>
        <UCard v-else class="w-full">
            <template #header>
                <SubHeading
                    :title="questionnaire?.title || $t('usageAnalytics.noQuestionnaireFound')"
                    :info="questionnaire?.description || ''"
                />
            </template>

            <!-- Questionnaire Answers -->
            <div class="flex flex-col space-y-8">
                <div v-if="!questionnaire?.questions?.length" class="text-sm text-gray-500">
                    {{ $t('usageAnalytics.noQuestionnaireForThisId') }}
                </div>
                <div v-for="answer in answers" :key="answer.id">
                    <UCard :ui="{ base: 'overflow-visible' }">
                        <template #header>
                            <div class="flex justify-start items-center gap-1">
                                <SubHeading
                                    :title="answer.question?.title || ''"
                                    :info="answer.question?.description || ''"
                                />
                                <div v-if="answer.question?.isRequired" class="text-red-500 text-sm">*</div>
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
            <div v-if="questionnaire?.questions?.length" class="flex gap-4 justify-between items-center mt-8">
                <UTooltip :text="$t('usageAnalytics.submitAnswers')">
                    <UButton
                        size="lg"
                        :label="$t('submit')"
                        color="primary"
                        variant="solid"
                        :disabled="isSubmitDisabled"
                        :loading="submitPending"
                        @click="saveAnswers"
                    />
                </UTooltip>
            </div>
        </UCard>
    </div>
</template>
