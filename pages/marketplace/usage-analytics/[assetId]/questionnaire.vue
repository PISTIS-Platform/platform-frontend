<script setup lang="ts">
import type { Question, QuestionAnswer, Questionnaire, SelectedOption } from '~/interfaces/usage-analytics';

const { t } = useI18n();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();
const route = useRoute();
const router = useRouter();

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
    const serverError = error.value as Record<string, any>;

    if (serverError?.statusCode === 400 || serverError?.statusCode === 404) {
        errorMsg.value = serverError?.data?.data?.message || t('usageAnalytics.errorInRetrievingQuestionnaire');
        //TODO:: add navigation to go back to previous page (?)
    } else {
        showErrorMessage(t('usageAnalytics.errorInRetrievingQuestionnaire'));
    }
} else {
    answers.value =
        questionnaire.value?.questions?.map((question: Question, questionIndex) => {
            const availableOptions =
                question.options?.map((option, optionIndex) => ({
                    id: (optionIndex + 1).toString(),
                    value: option?.text || '',
                    isSelected: false,
                })) || [];

            return {
                id: (questionIndex + 1).toString(),
                text: '',
                questionType: question.type,
                availableOptions,
                selectedOptions: [],
                question,
                isValid: !question.isRequired,
            };
        }) || [];
}

const isSubmitDisabled = computed(() => answers.value.some((a: QuestionAnswer) => !a.isValid) || submitPending.value);

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
            text?: string;
            options?: string[];
        }[];
    } = {
        assetId: route.params.assetId as string,
        responses: answers.value.map((answer) => ({
            questionId: answer.question?.id ?? '',
            questionTitle: answer.question?.title ?? '',
            text: answer?.text,
            options: answer.selectedOptions?.map((option: SelectedOption) => option.value),
        })),
    };

    try {
        await $fetch(`/api/usage-analytics/submit-answers`, {
            query: {
                id: questionnaire.value?.id,
                version: questionnaire.value?.version,
            },
            method: 'post',
            body,
        });

        showSuccessMessage(t('usageAnalytics.answersSubmitted'));
        await delay(3);
        router.push({ name: 'home' });
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
        <div v-else-if="!loadingQuestionnaire && error && !questionnaire">
            <UCard v-if="errorMsg" class="w-full">
                <SubHeading :title="errorMsg" />
            </UCard>
        </div>
        <UCard v-else class="w-full">
            <template #header>
                <SubHeading :title="questionnaire?.title || ''" :info="questionnaire?.description || ''" />
            </template>

            <!-- Questionnaire Answers -->
            <div class="flex flex-col space-y-8">
                <div v-if="!questionnaire?.questions?.length" class="text-sm text-gray-500">
                    {{ $t('usageAnalytics.noQuestionsWereFound') }}
                </div>
                <div v-for="answer in answers" v-else :key="answer.id">
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
