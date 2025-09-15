<script setup lang="ts">
import { type LocationSettings } from '~/interfaces/mask-settings';

/**
 * Contains reactive settings for the Location mask.
 * isLat indicates whehter this column is a latitude or not.
 */
const settings = reactive<LocationSettings>({
    isLat: false,
});

/**
 * Defines an event called settingsChange.
 */
const emit = defineEmits(['settingsChange']);

// Emit a settingsChange event on mount
onMounted(() => {
    emit('settingsChange', settings);
});

// Emit a settings change event when settings change.
watch(settings, () => {
    emit('settingsChange', settings);
});
</script>

<template>
    <!--Settings menu for the location mask-->
    <h4 class="font-bold">Description</h4>
    <p>Choose a latitude and longitude and randomise them while preserving their statistical properties</p>
    <h4 class="font-bold mt-2">Settings</h4>
    <div class="flex items-center gap-2">
        <label>Is latitude? </label>
        <UCheckbox v-model="settings.isLat"></UCheckbox>
    </div>
</template>
