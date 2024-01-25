<script setup lang="ts">
//import { useI18n } from 'vue-i18n';

// const { t } = useI18n();
import type { QuestionAnswer, Questionnaire } from '~/interfaces/data-usage';

// const toast = useToast();

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

const saveAnswers = () => {
    // applyValidation.value = true;
    // //if even at least 1 question has validation errors -> do not proceed
    // if (questions.value.some((q: Question) => !q.isValid)) {
    //     toast.add({ title: t('data.usage.questionnaire.checkInputs') });
    //     return;
    // }
    // applyValidation.value = false;
    // const questionsBody = questions.value.map((question: Question) => {
    //     return {
    //         title: question.title,
    //         description: '',
    //         type: question.type,
    //         options:
    //             question.options?.map((option: QuestionOption) => {
    //                 return {
    //                     text: option.text,
    //                     description: '',
    //                 };
    //             }) || [],
    //     };
    // });
    // //TODO:: add inputs for title/description
    // const body: Questionnaire = {
    //     questions: questionsBody,
    //     title: 'Test title',
    //     description: 'Test description',
    //     creatorId: '1234',
    //     assetId: props.assetId,
    // };
    // $fetch(`/api/data-usage/questionnaire/create/${props.assetId}`, {
    //     method: 'post',
    //     body,
    //     onResponse() {
    //         questions.value = [];
    //         toast.add({ title: t('data.usage.questionnaire.saved') });
    //     },
    //     onResponseError() {
    //         console.log('error occurred');
    //         toast.add({ title: t('data.usage.questionnaire.errorInSave') });
    //     },
    // });
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
                <div v-for="question in questionnaire.questions" :key="question.id">
                    <UCard :ui="{ base: 'overflow-visible' }">
                        <template #header>
                            <SubHeading :title="question?.title || ''" :info="question?.description || ''" />
                        </template>
                        <!-- <Question
                        :question="question"
                        :apply-validation="applyValidation"
                        @update:title="(value: string) => (question.title = value)"
                        @update:type="(value: string) => (question.type = value)"
                        @update:options="(options: QuestionOption[]) => (question.options = options)"
                        @is-valid="(isValid: boolean) => (question.isValid = isValid)"
                    >
                    </Question> -->
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
