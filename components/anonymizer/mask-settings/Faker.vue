<script setup lang="ts">
import { type FakerSettings } from '~/interfaces/mask-settings';
import { useAnonymizerStore } from '~/store/anonymizer';

const settings = reactive<FakerSettings>({
    replacer: 'name',
});

const emit = defineEmits(['settingsChange']);

const anonymizerStore = useAnonymizerStore();

//For settings to work anonymizerStore field metadata must be populated
const replacerNames = anonymizerStore.getMetadata.fakerOptions;

onMounted(() => {
    emit('settingsChange', settings);
});

watch(settings, () => {
    emit('settingsChange', settings);
});
</script>

<template>
    <h4 class="font-bold">Description</h4>
    <p>All values will be replaced with values from a select category.</p>
    <h4 class="font-bold">Settings</h4>
    <div class="flex items-center gap-2">
        <label>Category: </label>
        <USelect v-model="settings.replacer" :options="replacerNames" />
    </div>
</template>
