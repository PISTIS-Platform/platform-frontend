<script setup>
import { useI18n } from 'vue-i18n';

import { usePreviewStore } from '~/store/preview';

import Title from '../../components/anonymizer/Title.vue';

const { t } = useI18n();

const title = `${t('anonymizer.anonymizer')} - ${t('anonymizer.obfuscation')}`;
const previewStore = usePreviewStore();

previewStore.$subscribe((mutation, state) => {
    rows.value = state.tableRows;
});

const rows = ref(previewStore.tableRows);
</script>

<template>
    <Title :title="title" />
    <div class="flex flex-row flex-wrap justify-between gap-2">
        <UCard class="w-full">
            <h2>Data Preview</h2>
            <UTable :rows="rows" />
        </UCard>
    </div>
</template>
