<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
import type { Question, Questionnaire, QuestionOption } from '~/interfaces/data-usage';

const toast = useToast();

const props = defineProps({
    assetId: {
        type: String,
        required: true,
    },
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

    //if even at least 1 question has validation errors -> do not proceed
    if (questions.value.some((q: Question) => !q.isValid)) {
        toast.add({ title: t('data.usage.questionnaire.checkInputs') });
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
        title: 'Test title',
        description: 'Test description',
        creatorId: '1234',
        assetId: props.assetId,
    };

    $fetch(`/api/data-usage/questionnaire/create/${props.assetId}`, {
        method: 'post',
        body,
        onResponse() {
            questions.value = [];
            toast.add({ title: t('data.usage.questionnaire.saved') });
        },
        onResponseError() {
            toast.add({ title: t('data.usage.questionnaire.errorInSave') });
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
                <div class="flex flex-col space-y-8">
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
                        class="mt-3"
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
