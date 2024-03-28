<script setup lang="ts">
import { LocationSettings } from '~/interfaces/mask-settings';

const settings = reactive<LocationSettings>({
    isLat: false,
});

const emit = defineEmits(['settingsChange']);

onMounted(() => {
    emit('settingsChange', settings);
});

watch(settings, () => {
    emit('settingsChange', settings);
});
</script>

<template>
    <h4 class="font-bold">Description</h4>
    <p>Choose a latitude and longitude and randomise them while preserving their statistical properties</p>
    <h4 class="font-bold mt-2">Settings</h4>
    <div class="flex items-center gap-2">
        <label>Is latitude? </label>
        <UCheckbox v-model="settings.isLat"></UCheckbox>
    </div>
</template>
