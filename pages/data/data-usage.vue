<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
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

const assetId = computed(() => selected.value.split('Dataset ')[1]);
const loadingQuestionnaire = ref<boolean>(true);
const questionnaire = ref<Questionnaire | null>(null);

const updateMenuSelection = (value: string) => {
    menuOptionSelection.value = value;

    if (
        menuOptionSelection.value === t('data.usage.questionnaire.answerQuestionnaire') &&
        questionnaire.value === null
    ) {
        fetchQuestionnaire();
    }
};

const fetchQuestionnaire = async () => {
    if (!assetId.value) {
        return;
    }

    const { data, pending } = await useFetch(`/api/data-usage/questionnaire/${assetId.value}`);

    loadingQuestionnaire.value = pending.value;

    if (!data.value) {
        return;
    }

    const fetchedObject: Questionnaire = data.value as Questionnaire;

    questionnaire.value = {
        title: fetchedObject.title,
        description: fetchedObject.description,
        creatorId: fetchedObject.creatorId,
        assetId: fetchedObject.assetId,
        questions: fetchedObject.questions.map((question: Question) => {
            return {
                id: question.id,
                title: question.title,
                description: question.description,
                type: question.type,
                options: question.options?.map((option: QuestionOption) => {
                    return {
                        id: option.id,
                        text: option.text,
                        description: option.description,
                    };
                }),
            };
        }),
    };
};
</script>

<template>
    <div class="w-full h-full text-gray-700 space-y-8">
        <h1 class="text-2xl">
            {{ $t('data.usage.title') }}
        </h1>

        <DatasetSelection
            :selected="selected"
            @update:selected="(value: string) => (selected = value)"
            @update:menu-option-selection="(value: string) => updateMenuSelection(value)"
            @reset="reset"
        />

        <div v-if="menuOptionSelection !== ''">
            <div v-if="menuOptionSelection === $t('data.usage.questionnaire.buildQuestionnaire')">
                <Questionnaire :asset-id="assetId" />
            </div>

            <div v-else-if="menuOptionSelection === $t('data.usage.questionnaire.answerQuestionnaire')">
                <UProgress v-if="loadingQuestionnaire" animation="carousel" />
                <AnswerQuestionnaire
                    v-else-if="!loadingQuestionnaire && questionnaire"
                    :asset-id="assetId"
                    :questionnaire="questionnaire"
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
    </div>
</template>
