<script setup lang="ts">
import { type RangeSettings } from '~/interfaces/mask-settings';

const settings = reactive<RangeSettings>({
    interval: 1,
});

const emit = defineEmits(['settingsChange']);

onMounted(() => {
    emit('settingsChange', settings);
});

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
