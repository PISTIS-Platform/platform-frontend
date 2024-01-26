<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();
import type { Question, Questionnaire, QuestionOption } from '~/interfaces/data-usage';

const { isSuccessResponse } = useHttpHelper();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();

const props = defineProps({
    cardHeadingTitle: {
        type: String,
        required: true,
    },
    cardHeadingInfo: {
        type: String,
        required: false,
        default: '',
    },
    assetId: {
        type: String,
        required: false,
        default: null,
    },
    existingQuestionnaire: {
        type: Object as () => Questionnaire,
        required: true,
    },
});

const assetIdComputed = computed(() => (props.assetId && props.assetId.length ? props.assetId : null));

const questionnaire = ref<Questionnaire>(props.existingQuestionnaire || {});

const questionnaireSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, { message: t('required') }),
    description: z.string().trim(),
    is_published: z.boolean(),
});

const questions = ref<Question[]>(props.existingQuestionnaire.questions || []);
const applyValidation = ref<boolean>(false);
const publishQuestionnaire = ref<boolean>(false);
const publishQuestionnaireText = computed(() => {
    return t('data.usage.questionnaire.publish');
});

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
    const body = {
        title: questionnaire.value.title.trim(),
        description: questionnaire.value.description.trim(),
        is_published: questionnaire.value.is_published,
        is_public: assetIdComputed.value ? false : true,
        creatorId: '1234',
        assetId: assetIdComputed.value,
        questions: questionsBody,
    };

    $fetch(`/api/data-usage/questionnaire/create`, {
        method: 'post',
        body,
        onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
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
        <UCard class="w-full">
            <template #header>
                <SubHeading :title="props?.cardHeadingTitle || ''" :info="props?.cardHeadingInfo" />
            </template>
            <div>
                <UForm
                    class="flex flex-col justify-start items-start space-y-5 w-full"
                    :state="questionnaire"
                    :schema="questionnaireSchema"
                >
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

                    <!-- Questions -->
                    <div v-if="questions.length" class="flex flex-col space-y-8 w-full">
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

                    <!-- Button for adding question -->
                    <UTooltip text="Add Question" :popper="{ placement: 'right' }">
                        <UButton
                            icon="i-heroicons-plus"
                            size="xs"
                            color="primary"
                            variant="solid"
                            @click="addQuestion()"
                        />
                    </UTooltip>

                    <UFormGroup name="is_published">
                        <UCheckbox v-model="publishQuestionnaire" :label="publishQuestionnaireText" />
                    </UFormGroup>
                </UForm>
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
