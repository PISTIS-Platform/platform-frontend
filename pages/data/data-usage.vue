<script setup lang="ts">
import { DashboardData, DashboardOptions } from '~/interfaces/data-usage';

import { data, options } from './chart-data';

//data for selected dataset

const selected = ref<string>('');
const questionnaireOrDashboard = ref<string>('');

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
    questionnaireOrDashboard.value = '';
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
            @update:questionnaire-or-dashboard="(value: string) => (questionnaireOrDashboard = value)"
            @reset="reset"
        />

        <div v-if="questionnaireOrDashboard !== ''">
            <Questionnaire v-if="questionnaireOrDashboard === 'Questionnaire'" />

            <Dashboard v-else :selected="selected" :data="dashboardData" :options="dashboardOptions" @reset="reset" />
        </div>
    </div>
</template>
