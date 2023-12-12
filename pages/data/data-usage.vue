<script setup lang="ts">
import { DashboardData, DashboardOptions, Questionnaire } from '~/interfaces/data-usage';

import { data, options } from './chart-data';
import { dummyQuestionnaire } from './dummy-questionnaire';

//data for selected dataset

const selected = ref<string>('');
const questionnaireOrDashboard = ref<string>('');
const questionnaire = ref<Questionnaire>({
    title: '',
    questionnaireInfo: '',
    questions: [
        {
            question: undefined,
            answerType: undefined,
            answers: [],
            userAnswer: [],
        },
    ],
});

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

questionnaire.value = dummyQuestionnaire as Questionnaire;

// const submitAll = () => {
//     //TODO: Do something for submit here
//     console.log('SUCCESS');
// };

const reset = () => {
    selected.value = '';
    questionnaireOrDashboard.value = '';
    questionnaire.value = {
        title: '',
        questionnaireInfo: '',
        questions: [
            {
                question: undefined,
                answerType: undefined,
                answers: [],
                userAnswer: [],
            },
        ],
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
            @update:questionnaireOrDashboard="(value: string) => (questionnaireOrDashboard = value)"
            @reset="reset"
        />

        <!-- <Questionnaire :questionnaire-or-dashboard="questionnaireOrDashboard"
            v-if="questionnaireOrDashboard === 'Questionnaire'" :questionnaire="questionnaire"
            @update:questionnaire-userAnswer="(value: string[]) => (questionnaire.questions[0].userAnswer = value)"
            @submit="submitAll" @reset="reset" /> -->

        <Dashboard
            :questionnaire-or-dashboard="questionnaireOrDashboard"
            :selected="selected"
            :data="dashboardData"
            :options="dashboardOptions"
            @reset="reset"
        />
    </div>
</template>
