<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { Question, QuestionAnswer, Questionnaire, SelectedOption } from '~/interfaces/data-usage';

const { t } = useI18n();

const toast = useToast();
const { isSuccessResponse } = useHttpHelper();

const props = defineProps({
    assetId: {
        type: String,
        required: true,
    },
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
            isValid: false,
            userId: '789', //TODO:: replace with real user
        };
    });
};

initAnswers();

const saveAnswers = () => {
    console.log('Answers.. ');
    console.log(answers.value);

    // applyValidation.value = true;
    //if even at least 1 question has validation errors -> do not proceed
    if (answers.value.some((q: QuestionAnswer) => !q.isValid)) {
        toast.add({ title: t('data.usage.questionnaire.checkInputs') });
        return;
    }

    // const body = {
    //     questions: questionsBody,
    //     title: 'Test title',
    //     description: 'Test description',
    //     creatorId: '1234',
    //     assetId: props.assetId,
    // };
    return;

    $fetch(`/api/data-usage/questionnaire/answers`, {
        method: 'post',
        body: {},
        onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
                answers.value = [];
                toast.add({ title: t('data.usage.questionnaire.saved') });
            }
        },
        onResponseError() {
            toast.add({ title: t('data.usage.questionnaire.errorInSave') });
        },
    });
};

const resetQuestionnaire = () => {
    answers.value = [];
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
                            <SubHeading
                                :title="answer.question?.title || ''"
                                :info="answer.question?.description || ''"
                            />
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
                <UTooltip text="Reset Questionnaire">
                    <UButton size="lg" :label="$t('reset')" color="gray" variant="solid" @click="resetQuestionnaire" />
                </UTooltip>
                <UTooltip text="Save Questionnaire">
                    <UButton size="lg" :label="$t('submit')" color="primary" variant="solid" @click="saveAnswers" />
                </UTooltip>
            </div>
        </UCard>
    </Transition>
</template>
