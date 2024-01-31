<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();
import { HttpMethod } from '@/enums/httpEnums';
import type {
    Question,
    QuestionBody,
    QuestionnaireBody,
    QuestionnaireVersion,
    QuestionOption,
    QuestionOptionBody,
} from '~/interfaces/data-usage';

const route = useRoute();
const R = useRamda();

const questionnaireVersion = ref<QuestionnaireVersion>({
    id: '',
    questionnaireId: '',
    title: '',
    description: '',
    is_active: false,
    publicationDate: null,
    questions: [],
    isNew: true,
});

const loadingQuestionnaireVersion = ref<boolean>(false);
const hasErrorInRetrieval = ref<boolean>(false);

onMounted(async () => {
    //create new version from scratch
    if (route.query.questionnaireId && !route.query.questionnaireVersionId) {
        questionnaireVersion.value.isNew = false;
        questionnaireVersion.value.questionnaireId = route.query.questionnaireId as string;
    }

    //create new version from an existing one
    //make an api call to fetch the version
    if (route.query.questionnaireId && route.query.questionnaireVersionId) {
        loadingQuestionnaireVersion.value = true;
        const { data, pending, error } = await useFetch(
            `/api/data-usage/questionnaire/${route.query.questionnaireVersionId}`,
        );

        if (error.value) {
            hasErrorInRetrieval.value = true;
            showErrorMessage(t('data.usage.questionnaire.errorInFindVersion'));
            return;
        }

        hasErrorInRetrieval.value = false;
        loadingQuestionnaireVersion.value = pending.value;

        preExistingQuestionnaire.value = R.clone(data.value as QuestionnaireVersion);
        questionnaireVersion.value = data.value as QuestionnaireVersion;
        questions.value = questionnaireVersion.value.questions;
    }
});

const pageTitle = computed(() => {
    if (questionnaireVersion.value.isNew) {
        return t('data.usage.questionnaire.createNew');
    }

    return t('data.usage.questionnaire.createNewVersion');
});

const { isSuccessResponse } = useHttpHelper();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();

const schema = z.object({
    title: z
        .string()
        .trim()
        .min(1, { message: t('required') }),
    description: z.string().trim(),
    is_active: z.boolean(),
});

const preExistingQuestionnaire = ref<QuestionnaireVersion>();
const questions = ref<Question[]>(questionnaireVersion.value.questions || []);

const addQuestion = () => {
    const newQuestion: Question = {
        id: String(new Date().getTime()),
        type: undefined,
        title: undefined,
        options: [],
        //description: '',
        is_required: false,
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
            questionItem1.description !== questionItem2.description ||
            questionItem1.is_required !== questionItem2.is_required
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
});

const shouldDisableButton = ref<boolean>(false);

const isSaveDisabled = computed(() => {
    if (shouldDisableButton.value) {
        return true;
    }

    if (!questions.value.length) {
        return true;
    }

    if (questions.value.some((q: Question) => !q.isValid) || !schema.safeParse(questionnaireVersion.value).success) {
        return true;
    }

    if (
        questionsWereUpdated.value ||
        questionnaireVersion.value.title !== preExistingQuestionnaire.value?.title ||
        questionnaireVersion.value.description !== preExistingQuestionnaire.value?.description ||
        questionnaireVersion.value.is_active !== preExistingQuestionnaire.value.is_active
    ) {
        return false;
    }

    return true;
});

const navigateToMainPage = async () => {
    await navigateTo({
        path: '/data/data-usage',
    });
};

const saveQuestionnaire = async () => {
    if (!questions.value.length) {
        showErrorMessage(t('data.usage.questionnaire.noQuestionsAdded'));
        return;
    }

    //if even at least 1 question has validation errors -> do not proceed
    if (questions.value.some((q: Question) => !q.isValid) || !schema.safeParse(questionnaireVersion.value).success) {
        showErrorMessage(t('data.usage.questionnaire.checkInputs'));
        return;
    }

    // prepare the body for the request
    const body: QuestionnaireBody = {
        title: questionnaireVersion.value.title.trim(),
        description: (questionnaireVersion.value.description || '').trim(),
        is_active: questionnaireVersion.value.is_active,
        is_for_verified_buyers: route.query.for_verified_buyers === 'yes',
        creatorId: '1234',
        questions: questionsBody.value || [],
    };

    // prepare the url and method depending on whether it's a new or existing questionnaire version
    let url = `/api/data-usage/questionnaire/create`;
    let successMessage = t('data.usage.questionnaire.saved');

    if (!questionnaireVersion.value.isNew) {
        url = `/api/data-usage/questionnaire/create-new-version/${questionnaireVersion.value.questionnaireId}`;
        successMessage = t('data.usage.questionnaire.updated');

        delete body.is_for_verified_buyers;
        delete body.creatorId;
    }

    $fetch(url, {
        method: HttpMethod.POST,
        body,
        onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
                shouldDisableButton.value = true;

                showSuccessMessage(successMessage);

                setTimeout(navigateToMainPage, 1000);
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
    <div class="w-full h-full">
        <h1 class="text-2xl">
            {{ pageTitle }}
        </h1>
        <div v-if="loadingQuestionnaireVersion && !hasErrorInRetrieval" class="w-full mt-6">
            <UProgress animation="carousel" />
        </div>
        <div v-else-if="loadingQuestionnaireVersion && hasErrorInRetrieval">
            <UButton
                size="lg"
                color="gray"
                variant="solid"
                :label="$t('goBack')"
                class="mt-6"
                :trailing="false"
                @click="navigateToMainPage"
            />
        </div>
        <UCard v-else class="w-full mt-6">
            <div>
                <UForm
                    class="flex flex-col justify-start items-start space-y-5 w-full"
                    :state="questionnaireVersion"
                    :schema="schema"
                >
                    <!-- Questionnaire title and description-->
                    <UFormGroup :label="$t('data.usage.questionnaire.title')" required name="title" class="w-full">
                        <UInput
                            v-model="questionnaireVersion.title"
                            :placeholder="$t('data.usage.questionnaire.titleInfo')"
                        />
                    </UFormGroup>
                    <UFormGroup :label="$t('data.usage.questionnaire.description')" name="description" class="w-full">
                        <UTextarea
                            v-model="questionnaireVersion.description"
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

                    <UFormGroup name="is_active">
                        <UCheckbox
                            v-model="questionnaireVersion.is_active"
                            :label="$t('data.usage.questionnaire.activate')"
                        />
                    </UFormGroup>
                </UForm>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-4 justify-between items-center mt-8">
                <div class="flex gap-4">
                    <UTooltip :text="$t('cancel')">
                        <UButton
                            size="lg"
                            color="gray"
                            variant="solid"
                            :label="$t('cancel')"
                            :trailing="false"
                            @click="navigateToMainPage"
                        />
                    </UTooltip>
                    <UTooltip text="Reset Questionnaire">
                        <UButton
                            size="lg"
                            :label="$t('reset')"
                            color="gray"
                            variant="solid"
                            @click="resetQuestionnaire"
                        />
                    </UTooltip>
                </div>

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
    </div>
</template>
