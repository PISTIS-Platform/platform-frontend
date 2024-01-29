<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();
import { HttpMethod } from '@/enums/httpEnums';
import type {
    Question,
    QuestionBody,
    Questionnaire,
    QuestionnaireBody,
    QuestionOption,
    QuestionOptionBody,
} from '~/interfaces/data-usage';

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

const preExistingQuestionnaire = ref<QuestionnaireBody>();
const questions = ref<Question[]>(props.existingQuestionnaire.questions || []);
const applyValidation = ref<boolean>(false);
const publishQuestionnaire = ref<boolean>(questionnaire.value.is_published);
const publishQuestionnaireText = computed(() => t('data.usage.questionnaire.publish'));

onMounted(() => {
    preExistingQuestionnaire.value = {
        title: props.existingQuestionnaire.title,
        description: props.existingQuestionnaire.description,
        creatorId: props.existingQuestionnaire.creatorId,
        assetId: props.existingQuestionnaire.assetId,
        is_published: props.existingQuestionnaire.is_published,
        is_public: props.existingQuestionnaire.is_public,
        questions: props.existingQuestionnaire.questions.map((question: Question) => {
            return prepareQuestionBody(question);
        }),
    };
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

const hasDifferencesInQuestions = (): boolean => {
    const existingQuestions = preExistingQuestionnaire.value?.questions || [];
    const newQuestions = questionsBody.value;

    //check if more questions were added (or questions were removed)
    if (newQuestions.length !== existingQuestions.length) {
        return true;
    }

    //loop through all the questions objects of the pre existing and new array of questions
    //and check if there are differences
    for (let i = 0; i < newQuestions.length; i++) {
        const questionItem1: QuestionBody = existingQuestions[i];
        const questionItem2: QuestionBody = newQuestions[i];

        if (
            questionItem1.title !== questionItem2.title ||
            questionItem1.type !== questionItem2.type ||
            questionItem1.description !== questionItem2.description
        ) {
            return true;
        }

        if (questionItem1.options?.length !== questionItem2.options?.length) {
            return true;
        }

        if (questionItem1.options && questionItem2.options) {
            for (let i = 0; i < questionItem1.options?.length; i++) {
                const optionItem1: QuestionOptionBody = questionItem1.options[i];
                const optionItem2: QuestionOptionBody = questionItem2.options[i];

                if (optionItem1.text !== optionItem2.text || optionItem1.description !== optionItem2.description) {
                    return true;
                }
            }
        }
    }

    return false;
};

const prepareQuestionBody = (question: Question) => {
    return {
        title: question.title,
        description: '',
        type: question.type,
        is_required: question.is_required,
        options:
            question.options?.map((option: QuestionOption) => {
                return {
                    text: option.text,
                    description: '',
                };
            }) || [],
    };
};

const questionsBody = computed(() => {
    return questions.value.map((question: Question) => {
        return prepareQuestionBody(question);
    });
});

const questionsWereUpdated = computed(() => {
    return hasDifferencesInQuestions();
});

const isSaveDisabled = computed(() => {
    if (questionnaire.value.isNew) {
        return false;
    }

    if (
        questionsWereUpdated.value ||
        questionnaire.value.title !== preExistingQuestionnaire.value?.title ||
        questionnaire.value.description !== preExistingQuestionnaire.value?.description ||
        publishQuestionnaire.value !== preExistingQuestionnaire.value.is_published
    ) {
        return false;
    }

    return true;
});

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

    // prepare the body for the request
    const body: QuestionnaireBody = {
        title: questionnaire.value.title.trim(),
        description: (questionnaire.value.description || '').trim(),
        is_published: publishQuestionnaire.value,
        is_public: assetIdComputed.value ? false : true,
        creatorId: '1234',
        assetId: assetIdComputed.value,
        questions: questionsWereUpdated.value ? questionsBody.value : [],
    };

    // prepare the url and method depending on whether it's a new or existing questionnaire
    let url = `/api/data-usage/questionnaire/create`;
    let method = HttpMethod.POST;
    let successMessage = t('data.usage.questionnaire.saved');

    if (!questionnaire.value.isNew) {
        url = `/api/data-usage/questionnaire/${questionnaire.value.id}`;
        method = HttpMethod.PUT;
        successMessage = t('data.usage.questionnaire.updated');
    }

    $fetch(url, {
        method,
        body,
        onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
                showSuccessMessage(successMessage);
                preExistingQuestionnaire.value = body;
                preExistingQuestionnaire.value.questions = questionsBody.value;
                questionnaire.value.isNew = false;
                return;
            }

            showErrorMessage(t('data.usage.questionnaire.errorInSave'));
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
                                    @update:is_required="(value: boolean) => (question.is_required = value)"
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
                    <UButton
                        size="lg"
                        :label="$t('save')"
                        color="primary"
                        variant="solid"
                        :disabled="isSaveDisabled"
                        @click="saveQuestionnaire"
                    />
                </UTooltip>
            </div>
        </UCard>
    </Transition>
</template>
