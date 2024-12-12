<script setup lang="ts">
import { type RangeSettings } from '~/interfaces/mask-settings';

/**
 * Reactive state keeping track of range mask settings
 */
const settings = reactive<RangeSettings>({
    interval: 1,
});

/**
 * Defines an emit called settingsChange
 */
const emit = defineEmits(['settingsChange']);

/**
 * Emit settings change on initialisation
 */
onMounted(() => {
    emit('settingsChange', settings);
});

/**
 * Watch for changes in settings and emit the changed settings on the settingsChange event.
 */
watch(settings, () => {
    if (settings.interval < 1) {
        settings.interval = 1;
    } else {
        settings.interval = Number(settings.interval);
        emit('settingsChange', settings);
    }
});
</script>

<template>
    <!--Settings menu for anonymiser range mask.-->
    <h4 class="font-bold">Description</h4>
    <p>Replace numerical values with a range of values.</p>
    <h4 class="font-bold">Settings</h4>
    <div class="flex items-center gap-2">
        <label>Interval:</label>
        <UInput
            v-model="settings.interval"
            type="number"
            min="1"
            :class="{ 'border-red-500': settings.interval < 1 }"
        />
    </div>
</template>
