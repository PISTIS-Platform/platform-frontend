<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { QuestionnaireVersion } from '~/interfaces/data-usage';

const { t } = useI18n();

// import type { QuestionAnswer, QuestionOption, SelectedOption } from '~/interfaces/data-usage';
// import { QuestionType } from '~/interfaces/data-usage';

const props = defineProps({
    versionsData: {
        type: Array<QuestionnaireVersion>,
        required: true,
    },
    forVerifiedBuyers: {
        type: Boolean,
        required: true,
    },
});

const columns = [
    {
        key: 'title',
        label: t('data.usage.questionnaire.title'),
    },
    {
        key: 'description',
        label: t('data.usage.questionnaire.description'),
    },
    {
        key: 'publicationDate',
        label: t('data.usage.questionnaire.publicationDate'),
    },
    {
        key: 'is_active',
        label: t('data.usage.questionnaire.isActive'),
    },
    { key: 'actions', label: '', sortable: false, class: 'w-1/12 text-center' },
];

const pageCount = 5;
const { page, tableData, filteredRows } = useTable<QuestionnaireVersion>(pageCount);

tableData.value = props.versionsData;

const toggleIsActive = (value: boolean) => {
    console.log('toggleIsActive', { value });
    //TODO:: api call to activate version
    // should deactivate the rest
};

const navigateToCreateEdit = async (row?: QuestionnaireVersion) => {
    const questionnaireId = tableData.value.length ? tableData.value[0].questionnaireId : null;

    await navigateTo({
        path: '/data/add-questionnaire-version',
        query: {
            questionnaireVersionId: row?.id || null,
            questionnaireId: row?.questionnaireId || questionnaireId || null,
            for_verified_buyers: props.forVerifiedBuyers ? 'yes' : 'no',
        },
    });
};
</script>

<template>
    <div class="w-full">
        <UCard>
            <template #header>
                <div class="flex justify-between">
                    <SubHeading :title="$t('data.usage.questionnaire.versionsTitle')" />
                    <div class="ml-2 flex">
                        <UButton
                            icon="i-heroicons-plus-circle-20-solid"
                            size="md"
                            color="primary"
                            variant="solid"
                            :label="$t('create')"
                            @click="navigateToCreateEdit()"
                        />
                    </div>
                </div>
            </template>

            <UTable
                :columns="columns"
                :rows="filteredRows"
                :empty-state="{
                    icon: 'i-heroicons-circle-stack-20-solid',
                    label: $t('data.usage.questionnaire.noVersionsExist'),
                }"
            >
                <!-- Custom styling for ip data column -->
                <template #is_active-data="{ row }">
                    <div class="flex items-center justify-start">
                        <UToggle v-model="row.is_active" @click="toggleIsActive(!row.is_active)" />
                    </div>
                </template>
                <template #actions-data="{ row }">
                    <div class="justify-center flex">
                        <UButton
                            icon="i-heroicons-pencil"
                            size="xs"
                            color="primary"
                            variant="outline"
                            @click="navigateToCreateEdit(row)"
                        />
                    </div>
                </template>
            </UTable>

            <!-- Display the pagination only if the total number of transactions is larger than the page count -->
            <div v-if="filteredRows.length > pageCount" class="flex justify-end mt-2">
                <UPagination v-model="page" :page-count="pageCount" :total="props.versionsData.length" />
            </div>
        </UCard>
    </div>
</template>
