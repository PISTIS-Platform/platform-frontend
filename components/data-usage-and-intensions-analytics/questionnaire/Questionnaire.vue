<script setup lang="ts">
import type { Question } from '~/interfaces/data-usage';

const questions = ref<Question[]>([]);

const addQuestion = () => {
    const newQuestion: Question = {
        id: String(new Date().getTime()),
        type: '',
        title: '',
        description: '',
        options: [],
        allowMultipleSelect: false,
    };

    questions.value.push(newQuestion);
};

const saveQuestionnaire = () => {
    console.log('save questionnaire');
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
                                <SubHeading :title="`Question ${questions.indexOf(question) + 1}`" />
                            </template>
                            <Question :question="question"></Question>
                        </UCard>
                    </div>
                </div>
                <UTooltip text="Add Question">
                    <UButton
                        icon="i-heroicons-plus-circle-20-solid"
                        size="xl"
                        color="primary"
                        variant="ghost"
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
