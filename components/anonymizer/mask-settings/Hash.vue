<script setup lang="ts">
import { useAnonymizerStore } from '~/store/anonymizer';

/**
 * Defines a property called column that takes the name of a column
 */
const props = defineProps({
    column: {
        type: String,
        default: 'No Column Name!',
    },
});

/**
 * Defines an event called settingsChange used for
 * emitting this mask's settings.
 */
const emit = defineEmits(['settingsChange']);

/**
 * Reference to the anonymiser pinia store.
 */
const anonymizerStore = useAnonymizerStore();

//Anonymizer store should have report field populated for settings to work
onMounted(() => {
    emit('settingsChange', {
        classification: anonymizerStore.getReport[props.column].classification,
    });
});
</script>

<template>
    <!--Settings page for the hash mask. Hash mask has no state.-->
    <h4 class="font-bold">Description</h4>
    <p>This column will be replaced by a random value while preserving its formatting.</p>
</template>
~/store/anonymizer
