<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { DatasetKind } from '~/interfaces/dataset.enum';

const { t } = useI18n();

defineProps({
    selected: {
        type: Object as PropType<{ id: number | string; title: string; description: string }>,
        required: true,
    },
    completeOrQuery: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['reset', 'update:selected', 'update:complete-or-query']);

const switchDatasetOpen = ref<boolean>(false);

const dataSetSelections = computed(() => [
    {
        title: t('data.designer.completeDataset'),
        info: t('data.designer.selectDataset'),
        value: DatasetKind.COMPLETE,
    },
    {
        title: t('data.designer.queryFilter'),
        info: t('data.designer.selectQueryFilter'),
        value: DatasetKind.QUERY_FILTER,
        disabled: true,
    },
]);
</script>

<template>
    <UCard class="overflow-visible">
        <template #header>
            <SubHeading :title="$t('data.designer.datasetSelected')" :info="$t('data.designer.datasetSelectedInfo')" />
        </template>
        <div class="space-y-5">
            <div>
                <div v-if="selected.id" class="space-y-5">
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
                                <p class="font-bold">{{ selected.title }}</p>
                                <p>{{ selected.description }}</p>
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
                            :model-value="completeOrQuery"
                            class="gap-4"
                            :selections="dataSetSelections"
                            @update:model-value="(value: string) => emit('update:complete-or-query', value)"
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
