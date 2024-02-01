<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
import { DashboardData, DashboardOptions } from '~/interfaces/data-usage';
import { QuestionnaireVersion } from '~/interfaces/data-usage';

import { data, options } from './chart-data';

const { showErrorMessage } = useAlertMessage();

//data for selected dataset

const selected = ref<string>('');
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

const assetId = computed(() => {
    if (!selected.value.length) {
        return null;
    }

    return selected.value.split('Dataset ')[1];
});

const loadingQuestionnaireVersions = ref<boolean>(true);
const hasErrorInRetrieval = ref<boolean>(false);
const generalQuestionnaireVersions = ref<QuestionnaireVersion[]>([]);
const assetsQuestionnaireVersions = ref<QuestionnaireVersion[]>([]);

const fetchQuestionnaireVersions = async () => {
    loadingQuestionnaireVersions.value = true;
    hasErrorInRetrieval.value = false;

    const { data, pending, error } = await useFetch('/api/data-usage/questionnaire/versions');

    if (error.value) {
        hasErrorInRetrieval.value = true;
        loadingQuestionnaireVersions.value = false;
        showErrorMessage(t('data.usage.questionnaire.errorWhileRetrieving'));
        return;
    }

    interface FetchedVersions {
        for_general_users: QuestionnaireVersion[];
        for_verified_buyers: QuestionnaireVersion[];
    }

    generalQuestionnaireVersions.value = (data.value as FetchedVersions)?.for_general_users || [];
    assetsQuestionnaireVersions.value = (data.value as FetchedVersions)?.for_verified_buyers || [];

    loadingQuestionnaireVersions.value = pending.value;
};

const versionsSection = ref<HTMLElement>();

const updateQuestionnaireSelectedOption = (value: string) => {
    questionnaireOptionSelection.value = value;

    versionsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });

    if (value === generalUsersOption && generalQuestionnaireVersions.value.length) {
        return;
    }

    if (value === assetsOption && assetsQuestionnaireVersions.value.length) {
        return;
    }

    fetchQuestionnaireVersions();
};

// Selection cards options
const questionnaireOptions = computed(() => [
    {
        title: t('data.usage.questionnaire.generalQuestionnaire'),
        info: t('data.usage.questionnaire.generalQuestionnaireInfo'),
    },
    {
        title: t('data.usage.questionnaire.assetsQuestionnaire'),
        info: t('data.usage.questionnaire.assetsQuestionnaireInfo'),
    },
]);

const generalUsersOption = questionnaireOptions.value[0].title;
const assetsOption = questionnaireOptions.value[1].title;

const questionnaireOptionSelection = ref<string>('');
const assetCardSelectedOption = ref<string>('');
</script>

<template>
    <div class="w-full h-full text-gray-700 space-y-8">
        <h1 class="text-2xl">
            {{ $t('data.usage.title') }}
        </h1>

        <DatasetSelection
            :selected="selected"
            @update:selected="(value: string) => (selected = value)"
            @update:card-selected-option="(value: string) => (assetCardSelectedOption = value)"
            @reset="selected = ''"
        ></DatasetSelection>

        <div v-if="assetId">
            <div v-if="assetCardSelectedOption !== ''">
                <QuestionnaireAnswersForm
                    v-if="assetCardSelectedOption === t('data.usage.questionnaire.answerQuestionnaire')"
                ></QuestionnaireAnswersForm>
                <Dashboard
                    v-else
                    :selected="selected"
                    :data="dashboardData"
                    :options="dashboardOptions"
                    @reset="selected = ''"
                />
            </div>
        </div>

        <div v-else>
            <UCard class="w-full">
                <template #header>
                    <div class="flex justify-between">
                        <SubHeading :title="$t('data.usage.questionnaire.selectType')" />
                    </div>
                </template>

                <SelectionCards
                    :model-value="questionnaireOptionSelection"
                    class="gap-4"
                    :selections="questionnaireOptions"
                    @update:model-value="(value: string) => updateQuestionnaireSelectedOption(value)"
                />

                <div v-if="questionnaireOptionSelection !== ''" ref="versionsSection" class="flex flex-col w-full mt-8">
                    <div v-if="loadingQuestionnaireVersions">
                        <UProgress animation="carousel" />
                    </div>

                    <!-- Table with versions for questionnaire for general users -->
                    <div
                        v-if="
                            questionnaireOptionSelection === generalUsersOption &&
                            !loadingQuestionnaireVersions &&
                            !hasErrorInRetrieval
                        "
                        class="w-full"
                    >
                        <VersionsTable
                            :versions-data="generalQuestionnaireVersions"
                            :for-verified-buyers="false"
                            @update-data="fetchQuestionnaireVersions"
                        />
                    </div>

                    <!-- Table with versions for questionnaire for verified buyers (for all assets) -->
                    <div
                        v-if="
                            questionnaireOptionSelection === assetsOption &&
                            !loadingQuestionnaireVersions &&
                            !hasErrorInRetrieval
                        "
                        class="w-full"
                    >
                        <VersionsTable
                            :versions-data="assetsQuestionnaireVersions"
                            :for-verified-buyers="true"
                            @update-data="fetchQuestionnaireVersions"
                        />
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>
