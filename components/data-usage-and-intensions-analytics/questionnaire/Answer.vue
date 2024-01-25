<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();

import type { QuestionAnswer, QuestionOption, SelectedOption } from '~/interfaces/data-usage';
import { QuestionType } from '~/interfaces/data-usage';

const props = defineProps({
    answer: {
        type: Object as () => QuestionAnswer,
        required: true,
    },
});

// Schema for all the inputs
const schema = z.object({
    text: z
        .string()
        .trim()
        .min(1, { message: t('required') }),
    options: z.array(z.boolean()).min(1),
});

//check if inputs are valid
const isValid = computed(() => {
    return schema.safeParse({
        text: props.answer.text,
        //options: props.answer.options,
    }).success;
});

//TODO:: check if watcher can be avoided
watch(isValid, () => {
    emit('isValid', isValid.value);
});

const selectedOptions = ref<SelectedOption[]>(
    (props.answer?.availableOptions || []).map((availableOption: QuestionOption) => {
        return {
            id: availableOption?.id || '',
            label: availableOption?.text || '',
            value: availableOption?.id || '',
            isSelected: false,
        };
    }),
);

const selectedRadioOption = ref<string>('');

const updateRadioOptionSelection = (id: string) => {
    selectedOptions.value = selectedOptions.value.map((o: SelectedOption) => ({
        ...o,
        isSelected: false,
    }));

    updateSelectedOptions(id, true);
};

const updateSelectedOptions = (id: string, isSelected: boolean) => {
    const optionObject = selectedOptions.value.find((o: SelectedOption) => o.id === id);

    if (!optionObject) {
        return;
    }

    optionObject.isSelected = isSelected;

    // emit only options who are selected
    emit(
        'update:selectedOptions',
        selectedOptions.value.filter((o: SelectedOption) => o.isSelected),
    );
};

const emit = defineEmits(['update:text', 'update:selectedOptions', 'isValid']);
</script>

<template>
    <div class="w-full">
        <UForm :state="props.answer" :schema="schema">
            <!-- Display Content based on question type -->

            <!-- Text based Question -->
            <div v-if="props.answer.questionType === QuestionType.TEXT">
                <UFormGroup required name="text">
                    <UTextarea
                        :model-value="answer.text"
                        :placeholder="$t('data.usage.questionnaire.answerTextInfo')"
                        class="w-full flex-1"
                        @update:model-value="(value: string) => emit('update:text', value)"
                    />
                </UFormGroup>
            </div>

            <div v-else-if="props.answer.questionType === QuestionType.CHECKBOX">
                <UFormGroup required name="checkBoxOptions">
                    <div class="flex gap-6">
                        <div v-for="option in selectedOptions" :key="option.id">
                            <UCheckbox
                                :model-value="option.isSelected"
                                :label="option.label"
                                @update:model-value="(value: boolean) => updateSelectedOptions(option.id, value)"
                            />
                        </div>
                    </div>
                </UFormGroup>
            </div>

            <div v-else>
                <UFormGroup required name="radioOptions">
                    <div class="flex gap-6">
                        <URadio
                            v-for="option of selectedOptions"
                            :key="option.id"
                            :model-value="selectedRadioOption"
                            v-bind="option"
                            @update:model-value="(value: string) => updateRadioOptionSelection(option.id)"
                        />
                    </div>
                </UFormGroup>
            </div>
        </UForm>
    </div>
</template>
