<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { HttpCode, HttpMethod } from '@/enums/httpEnums';
import { QuestionnaireVersion } from '~/interfaces/data-usage';

const { t } = useI18n();

const { isSuccessResponse } = useHttpHelper();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();
const { formatToTimestamp } = useDateHelper();

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
        sortable: true,
    },
    {
        key: 'description',
        label: t('data.usage.questionnaire.description'),
        sortable: true,
    },
    {
        key: 'publicationDate',
        label: t('data.usage.questionnaire.publicationDate'),
        sortable: true,
    },
    {
        key: 'is_active',
        label: t('data.usage.questionnaire.isActive'),
        sortable: true,
    },
    { key: 'actions', label: '', sortable: false, class: 'w-1/12 text-center' },
];

const pageCount = 10;
const { page, tableData, filteredRows, searchString } = useTable<QuestionnaireVersion>(pageCount);

tableData.value = props.versionsData.map((version: QuestionnaireVersion) => {
    return {
        ...version,
        publicationDate: formatToTimestamp(version.publicationDate),
    };
});

const updateTableData = (updatedVersion: QuestionnaireVersion, isActive: boolean, shouldUpdateOthers: boolean) => {
    tableData.value = tableData.value.map((version: QuestionnaireVersion) => {
        if (version.id === updatedVersion.id) {
            const pubDate = !shouldUpdateOthers
                ? version.publicationDate
                : isActive
                ? formatToTimestamp(updatedVersion.publicationDate)
                : null;

            return {
                ...version,
                is_active: isActive,
                publicationDate: pubDate,
            };
        }

        if (shouldUpdateOthers && isActive) {
            return {
                ...version,
                is_active: false,
            };
        }

        return version;
    });
};

const toggleIsActive = async (version: QuestionnaireVersion, value: boolean) => {
    // api call to activate version
    await useFetch(`/api/data-usage/questionnaire/activate-version/${version.id}`, {
        body: { is_active: value },
        method: HttpMethod.POST,
        onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
                const successMsg = value
                    ? t('data.usage.questionnaire.activated')
                    : t('data.usage.questionnaire.deactivated');
                showSuccessMessage(successMsg);

                updateTableData(response._data.result, value, true);

                return;
            }
        },
        onResponseError() {
            const errorMsg = !value
                ? t('data.usage.questionnaire.errorInDeactivation')
                : t('data.usage.questionnaire.errorInActivation');
            showErrorMessage(errorMsg);

            //revert data
            updateTableData(version, !value, false);
        },
    });
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

const deleteVersion = async () => {
    if (!versionForDeletion.value) {
        return;
    }

    // api call to activate version
    await useFetch(`/api/data-usage/questionnaire/delete-version/${versionForDeletion.value.id}`, {
        method: HttpMethod.DELETE,
        onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
                showSuccessMessage(t('data.usage.questionnaire.deleted'));
                tableData.value = tableData.value.filter(
                    (v: QuestionnaireVersion) => versionForDeletion.value && v.id !== versionForDeletion.value.id,
                );
            }

            deleteConfirmationOpen.value = false;
            versionForDeletion.value = null;
        },
        onResponseError({ response }) {
            if (response.status === HttpCode.HTTP_BAD_REQUEST_ERROR) {
                showErrorMessage(response._data.data.message);
                return;
            }
            showErrorMessage(t('data.usage.questionnaire.errorInDeletion'));
        },
    });
};

const deleteConfirmationOpen = ref<boolean>(false);
const versionForDeletion = ref<QuestionnaireVersion | null>(null);

//const emit = defineEmits(['updateData']);
</script>

<template>
    <div class="w-full">
        <UCard>
            <template #header>
                <div :class="['flex justify-between', tableData.length > 1 ? 'items-start' : 'items-center']">
                    <div class="flex flex-col gap-4">
                        <SubHeading :title="$t('data.usage.questionnaire.versionsTitle')" />
                        <div v-if="tableData.length > 1" class="flex w-96">
                            <UInput
                                v-model="searchString"
                                size="md"
                                :placeholder="$t('data.dmRepository.search')"
                                class="w-full"
                            />
                        </div>
                    </div>
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
                <template #is_active-data="{ row }">
                    <div class="flex items-center justify-start">
                        <UTooltip
                            :text="
                                row.is_active
                                    ? $t('data.usage.questionnaire.deactivate')
                                    : $t('data.usage.questionnaire.activate') +
                                      ' ' +
                                      $t('data.usage.questionnaire.alsoPublish')
                            "
                        >
                            <UToggle v-model="row.is_active" @click="toggleIsActive(row, !row.is_active)" />
                        </UTooltip>
                    </div>
                </template>

                <template #actions-data="{ row }">
                    <div class="justify-center flex gap-2">
                        <UTooltip :text="$t('data.usage.questionnaire.createNewVersionFromExisting')">
                            <UButton
                                icon="i-heroicons-pencil"
                                size="xs"
                                color="primary"
                                variant="outline"
                                @click="navigateToCreateEdit(row)"
                            />
                        </UTooltip>
                        <UTooltip
                            :ui="row._count.answers > 0 ? { width: 'max-w-xl' } : {}"
                            :text="
                                row._count.answers > 0
                                    ? $t('data.usage.questionnaire.cannotDelete')
                                    : $t('data.usage.questionnaire.deleteVersion')
                            "
                        >
                            <UButton
                                :ui="{ base: 'disabled:opacity-50' }"
                                icon="i-heroicons-trash"
                                size="xs"
                                color="primary"
                                variant="outline"
                                :disabled="row._count.answers > 0"
                                @click="(deleteConfirmationOpen = true), (versionForDeletion = row)"
                            />
                        </UTooltip>
                    </div>
                </template>
            </UTable>

            <!-- Display the pagination only if the total number of transactions is larger than the page count -->
            <div v-if="tableData.length > pageCount" class="flex justify-end mt-2">
                <UPagination v-model="page" :page-count="pageCount" :total="tableData.length" />
            </div>
        </UCard>
        <UModal v-model="deleteConfirmationOpen">
            <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
                <p class="font-bold text-xl">{{ $t('data.designer.areYouSure') }}</p>
                <p class="text-gray-400 mt-6">{{ $t('data.usage.questionnaire.deleteVersionInfo') }}</p>
                <div class="flex gap-8 w-full justify-center mt-6">
                    <UButton
                        color="white"
                        class="w-20 flex justify-center"
                        @click="(deleteConfirmationOpen = false), (versionForDeletion = null)"
                        >{{ $t('cancel') }}</UButton
                    >
                    <UButton class="w-20 flex justify-center" @click="deleteVersion()">{{ $t('yes') }}</UButton>
                </div>
            </UCard>
        </UModal>
    </div>
</template>
