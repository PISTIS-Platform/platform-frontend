<script setup lang="ts">
import { useAnonymizerStore } from '~/store/anonymizer';

const props = defineProps({
    column: {
        type: String,
        default: 'No Column Name!',
    },
});

const emit = defineEmits(['settingsChange']);

const anonymizerStore = useAnonymizerStore();

//Anonymizer store should have report field populated for settings to work
onMounted(() => {
    emit('settingsChange', {
        classification: anonymizerStore.getReport[props.column].classification,
    });
});
</script>

<template>
    <h4 class="font-bold">Description</h4>
    <p>This column will be replaced by a random value while preserving its formatting.</p>
</template>
~/store/anonymizer
