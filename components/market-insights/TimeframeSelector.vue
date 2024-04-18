<script setup lang="ts">
import type Selection from '~/interfaces/selection';

const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    isInterval: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const { t } = useI18n();

const timeframeBeforeSelections: Selection[] = [
    {
        label: t('before.day'),
        value: 'D',
    },
    {
        label: t('before.week'),
        value: 'W',
    },
    {
        label: t('before.month'),
        value: 'M',
    },
];

const timeframeIntervalSelections: Selection[] = [
    {
        label: t('intervals.daily'),
        value: 'D',
    },
    {
        label: t('intervals.weekly'),
        value: 'W',
    },
    {
        label: t('intervals.monthly'),
        value: 'M',
    },
];

const selections = computed(() => (props.isInterval ? timeframeIntervalSelections : timeframeBeforeSelections));

const emit = defineEmits(['update:model-value']);
</script>

<template>
    <UButtonGroup size="md" orientation="horizontal">
        <UButton
            v-for="item in selections"
            :key="item.value"
            :label="item.label"
            color="white"
            :class="[
                'relative text-gray-600 hover:bg-primary-100',
                props.modelValue === item.value
                    ? 'text-white bg-primary-500 hover:bg-primary-500 hover:text-white'
                    : '',
                item.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
            ]"
            @click="item.disabled ? '' : emit('update:model-value', item.value)"
        />
    </UButtonGroup>
</template>
