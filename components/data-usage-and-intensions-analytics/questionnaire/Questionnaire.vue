<script setup lang="ts">
import type { Question, QuestionOption } from '~/interfaces/data-usage';

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

const removeQuestion = (id: string) => {
    const indexToRemove = questions.value.findIndex((item: Question) => item.id === id);

    if (indexToRemove !== -1) {
        questions.value.splice(indexToRemove, 1);
    }
};

const applyValidation = ref<boolean>(false);

const saveQuestionnaire = () => {
    console.log('save questionnaire...');
    applyValidation.value = true;
    console.log(questions.value);

    //if even at least 1 question has validation errors -> do not proceed
    if (questions.value.some((q: Question) => !q.isValid)) {
        console.log('Validation error found !!');
        return;
    }

    applyValidation.value = false;

    //TODO:: api call for saving
    console.log('PROCEED with saving questionnaire..');
};
const resetQuestionnaire = () => {
    console.log('save questionnaire');
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
            <div class="flex gap-4 justify-start items-center mt-8">
                <UTooltip text="Reset Questionnaire">
                    <UButton size="md" :label="$t('Reset')" color="gray" variant="solid" @click="resetQuestionnaire" />
                </UTooltip>
                <UTooltip text="Save Questionnaire">
                    <UButton size="md" :label="$t('Save')" color="primary" variant="solid" @click="saveQuestionnaire" />
                </UTooltip>
            </div>
        </UCard>
    </Transition>
</template>
