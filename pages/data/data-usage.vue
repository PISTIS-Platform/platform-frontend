<script setup lang="ts">
// import { useI18n } from 'vue-i18n';

// const { t } = useI18n();
import type { Question, Questionnaire, QuestionOption } from '~/interfaces/data-usage';
import { DashboardData, DashboardOptions } from '~/interfaces/data-usage';

import { data, options } from './chart-data';

//data for selected dataset

const selected = ref<string>('');
const menuOptionSelection = ref<string>('');

//Dashboard data
const dashboardData = ref<DashboardData>({
    labels: [],
    datasets: [
        {
            label: '',
            backgroundColor: '',
            data: [],
        },
    ],
});
dashboardData.value = data;
const dashboardOptions = ref<DashboardOptions>();
dashboardOptions.value = options;

const reset = () => {
    selected.value = '';
    menuOptionSelection.value = '';
};

const assetId = computed(() => {
    if (!selected.value.length) {
        return null;
    }

    return selected.value.split('Dataset ')[1];
});

const getInitializedQuestionnaire = (): Questionnaire => {
    return {
        id: '',
        title: '',
        description: '',
        creatorId: '1234',
        assetId: assetId.value || null,
        is_published: false,
        is_public: false,
        questions: [],
        isNew: true,
    };
};

const loadingQuestionnaire = ref<boolean>(true);
const generalQuestionnaire = ref<Questionnaire>(getInitializedQuestionnaire());
const assetQuestionnaire = ref<Questionnaire>(getInitializedQuestionnaire());

const updateSelectedAsset = (value: string) => {
    selected.value = value;

    fetchQuestionnaire();
};

const updateMenuSelection = (value: string) => {
    menuOptionSelection.value = value;

    // if (
    //     menuOptionSelection.value === t('data.usage.questionnaire.answerQuestionnaire') &&
    //     (questionnaire.value === null || (assetId.value && questionnaire.value?.assetId !== assetId.value))
    // ) {
    //     fetchQuestionnaire();
    // }
};

const fetchQuestionnaire = async () => {
    loadingQuestionnaire.value = true;

    const { data, pending } = await useFetch('/api/data-usage/questionnaire/find', {
        query: { assetId: assetId.value },
    });

    if (!data.value) {
        loadingQuestionnaire.value = pending.value;
        return;
    }

    const fetchedObject: Questionnaire = data.value as Questionnaire;

    const questions: Question[] =
        fetchedObject?.versions?.[0].questions.map((question: Question) => {
            return {
                id: question.id,
                title: question.title,
                description: question.description,
                type: question.type,
                isValid: true,
                options: question.options?.map((option: QuestionOption) => {
                    return {
                        id: option.id,
                        text: option.text,
                        description: option.description,
                    };
                }),
            };
        }) || [];

    const transformedQuestionnaire = {
        id: fetchedObject.id,
        title: fetchedObject.title,
        description: fetchedObject.description,
        creatorId: fetchedObject.creatorId,
        assetId: fetchedObject.assetId,
        is_published: fetchedObject.is_published,
        is_public: fetchedObject.is_public,
        questions,
        isNew: false,
    };

    if (assetId.value) {
        assetQuestionnaire.value = transformedQuestionnaire;
    } else {
        generalQuestionnaire.value = transformedQuestionnaire;
    }

    loadingQuestionnaire.value = pending.value;
};

fetchQuestionnaire();
</script>

<template>
    <div class="w-full h-full text-gray-700 space-y-8">
        <h1 class="text-2xl">
            {{ $t('data.usage.title') }}
        </h1>

        <DatasetSelection
            :selected="selected"
            @update:selected="(value: string) => updateSelectedAsset(value)"
            @update:menu-option-selection="(value: string) => updateMenuSelection(value)"
            @reset="reset"
        />

        <div v-if="assetId">
            <div
                v-if="
                    menuOptionSelection === $t('data.usage.questionnaire.buildQuestionnaire') ||
                    menuOptionSelection === ''
                "
            >
                <Questionnaire
                    v-if="!loadingQuestionnaire"
                    :existing-questionnaire="assetQuestionnaire"
                    :asset-id="assetId"
                    :card-heading-title="$t('data.usage.questionnaire.build')"
                />
            </div>

            <div v-else-if="menuOptionSelection === $t('data.usage.questionnaire.answerQuestionnaire')">
                <UProgress v-if="loadingQuestionnaire" animation="carousel" />
                <AnswerQuestionnaire
                    v-else-if="!loadingQuestionnaire && assetQuestionnaire.questions.length"
                    :questionnaire="assetQuestionnaire"
                />
                <div v-else>
                    <Transition
                        enter-active-class="duration-300 ease-out"
                        enter-from-class="transform opacity-0"
                        enter-to-class="opacity-100"
                        leave-active-class="duration-300 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="transform opacity-0"
                    ></Transition>
                    <div class="flex w-full justify-center items-center h-64 font-semibold">
                        {{ $t('data.usage.questionnaire.noQuestionnaireFound') }}
                    </div>
                </div>
            </div>

            <Dashboard v-else :selected="selected" :data="dashboardData" :options="dashboardOptions" @reset="reset" />
        </div>

        <div v-else class="flex w-full">
            <Questionnaire
                v-if="!loadingQuestionnaire"
                :existing-questionnaire="generalQuestionnaire"
                :card-heading-title="$t('data.usage.questionnaire.generalQuestionnaire')"
                :card-heading-info="$t('data.usage.questionnaire.generalQuestionnaireInfo')"
            />
        </div>
    </div>
</template>
