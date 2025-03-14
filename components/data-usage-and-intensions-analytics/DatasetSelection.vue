<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import dummyData from '../../pages/data/dummy-data';

const { t } = useI18n();

defineProps({
    selected: {
        type: String,
        required: true,
    },
    questionnaireOrDashboard: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['reset', 'update:selected', 'update:questionnaire-or-dashboard']);

//data for selecting specific dataset

const selections = Object.keys(dummyData);
const displayTable = ref<boolean>(false);

const switchDatasetOpen = ref<boolean>(false);

const filteredSelections = computed(() =>
    outerQuery.value ? selections.filter((selection: string) => selection.includes(outerQuery.value)) : selections,
);

const outerQuery = ref<string>('');

const dataSetSelections = computed(() => [
    {
        title: t('data.usage.questionnaire'),
        info: t('data.usage.questionnaireInfo'),
    },
    {
        title: t('data.usage.dashboard'),
        info: t('data.usage.dashboardInfo'),
    },
]);

function toggleTable() {
    displayTable.value = !displayTable.value;
}
</script>

<template>
    <UCard class="overflow-visible">
        <template #header>
            <SubHeading
                :title="$t('data.designer.datasetSelection')"
                :info="$t('data.designer.datasetSelectionInfo')"
            />
        </template>
        <div class="space-y-5">
            <div v-if="!selected" class="flex">
                <USelectMenu
                    :model-value="selected"
                    icon="i-heroicons-magnifying-glass-20-solid"
                    :searchable="
                        (query: string) => {
                            outerQuery = query;
                            return selections.filter((selection: string) => selection.includes(query));
                        }
                    "
                    :searchable-placeholder="$t('data.designer.searchDataset')"
                    :placeholder="$t('data.designer.selectSearchDataset')"
                    :options="selections"
                    size="md"
                    class="w-full"
                    @update:model-value="(value: string) => emit('update:selected', value)"
                />

                <UButton
                    size="md"
                    block
                    class="w-36 ml-2"
                    :label="displayTable ? 'Hide datasets' : 'Browse datasets'"
                    @click="toggleTable"
                />
            </div>
            <div
                v-else
                class="flex gap-2 items-center text-primary cursor-pointer w-60"
                @click="switchDatasetOpen = true"
            >
                <UIcon name="i-heroicons-arrow-left-20-solid" class="h-5 w-5" />
                <span>{{ $t('data.designer.selectDifferent') }}</span>
            </div>

            <div>
                <div v-if="!selected && displayTable">
                    <Transition
                        enter-active-class="duration-300 ease-out"
                        enter-from-class="transform opacity-0"
                        enter-to-class="opacity-100"
                    >
                        <FileBrowser
                            :model-value="selected"
                            :files="filteredSelections"
                            @update:model-value="(value: string) => emit('update:selected', value)"
                        />
                    </Transition>
                </div>
                <div v-if="selected" class="space-y-5">
                    <Transition
                        enter-active-class="duration-300 ease-out"
                        enter-from-class="transform opacity-0"
                        enter-to-class="opacity-100"
                        leave-active-class="duration-300 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="transform opacity-0"
                    >
                        <div class="flex gap-4 w-full">
                            <div class="flex flex-col items-start justify-start gap-4 whitespace-nowrap">
                                <p>{{ $t('data.designer.assetTitle') }}:</p>
                                <p>{{ $t('data.designer.assetDescription') }}:</p>
                            </div>
                            <div class="flex flex-col items-start justify-start gap-4">
                                <p class="font-bold">{{ selected }}</p>
                                <p>{{ dummyData[selected].description }}</p>
                            </div>
                        </div>
                    </Transition>
                    <Transition
                        enter-active-class="duration-300 ease-out"
                        enter-from-class="transform opacity-0"
                        enter-to-class="opacity-100"
                        leave-active-class="duration-300 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="transform opacity-0"
                    >
                        <SelectionCards
                            :model-value="questionnaireOrDashboard"
                            class="gap-4"
                            :selections="dataSetSelections"
                            @update:model-value="(value: string) => emit('update:questionnaire-or-dashboard', value)"
                        />
                    </Transition>
                </div>
            </div>
        </div>
    </UCard>
    <UModal v-model="switchDatasetOpen">
        <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
            <p class="font-bold text-xl">{{ $t('data.designer.areYouSure') }}</p>
            <p class="text-gray-400 mt-6">{{ $t('data.designer.willReset') }}</p>
            <div class="flex gap-8 w-full justify-center mt-6">
                <UButton color="white" class="w-20 flex justify-center" @click="switchDatasetOpen = false">{{
                    $t('cancel')
                }}</UButton>
                <UButton class="w-20 flex justify-center" @click="emit('reset'), (switchDatasetOpen = false)">{{
                    $t('yes')
                }}</UButton>
            </div>
        </UCard>
    </UModal>
</template>
