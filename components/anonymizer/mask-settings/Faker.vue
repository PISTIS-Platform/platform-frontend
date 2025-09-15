<script setup lang="ts">
import { type FakerSettings } from '~/interfaces/mask-settings';
import { useAnonymizerStore } from '~/store/anonymizer';

/**
 * Reactive settings for the faker mask.
 * Replacer contains the name of a faker provider.
 */
const settings = reactive<FakerSettings>({
    replacer: 'name',
});

/**
 * Defines an event called settingsChange
 */
const emit = defineEmits(['settingsChange']);

/**
 * Reference to the anonymiser pinia store.
 */
const anonymizerStore = useAnonymizerStore();

/**
 * A list of names of providers that faker uses to generate fake data.
 */
const replacerNames = anonymizerStore.getMetadata.fakerOptions;

/**
 * Emit a settingsChange event on mount
 */
onMounted(() => {
    emit('settingsChange', settings);
});

// Listen for changes in the settings object and emit the settings object
// if any changes occur.
watch(settings, () => {
    emit('settingsChange', settings);
});
</script>

<template>
    <!--Settings menu for the faker mask-->
    <h4 class="font-bold">Description</h4>
    <p>All values will be replaced with values from a select category.</p>
    <h4 class="font-bold">Settings</h4>
    <div class="flex items-center gap-2">
        <label>Category: </label>
        <USelect v-model="settings.replacer" :options="replacerNames" />
    </div>
</template>
