<script setup lang="ts">
import { QuestionType } from '~/interfaces/data-usage';

// const props = defineProps({
//     question: {
//         type: Object as () => Question,
//         required: true,
//     },
// });

const questionTypes: string[] = [QuestionType.TEXT, QuestionType.CHECKBOX, QuestionType.RADIO, QuestionType.DROPDOWN];
const selectedQuestionType = ref<string>('');

const title = ref<string>('');

const emit = defineEmits(['update:title', 'update:option']);
</script>

<template>
    <div class="w-full">
        <USelectMenu
            v-model="selectedQuestionType"
            :placeholder="$t('data.usage.questionnaire.selectQuestionType')"
            :options="questionTypes"
            size="md"
            class="flex w-52"
        />

        <div v-if="selectedQuestionType !== ''" class="mt-3">
            <div v-if="selectedQuestionType === QuestionType.TEXT">
                <UFormGroup :label="$t('title')" required name="title">
                    <UInput
                        :model-value="title"
                        :placeholder="$t('data.usage.questionnaire.questionTitle')"
                        @update:model-value="(value: string) => emit('update:title', value)"
                    />
                </UFormGroup>
            </div>
            <div v-else-if="selectedQuestionType === QuestionType.CHECKBOX">
                <h1>Checkbox</h1>
            </div>
            <div v-else></div>
        </div>
    </div>
</template>
