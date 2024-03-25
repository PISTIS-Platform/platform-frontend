<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import Title from '../../components/anonymizer/Title.vue';
import { data, formatPreview } from './data';

const { t } = useI18n();

const title = `${t('anonymizer.anonymizer')} - ${t('anonymizer.obfuscation')}`;
const rows = ref([]);
const columns = ref([]);

onMounted(() => {
    rows.value = formatPreview(data);
    columns.value = Object.keys(rows.value);
});
</script>

<template>
    <Title :title="title" />
    <div class="flex flex-row flex-wrap justify-between gap-2">
        <UCard class="w-full">
            <h2>Data Preview</h2>
            <table>
                <tr>
                    <th v-for="(column, index) in columns" :key="index">{{ column }}</th>
                </tr>
                <tr v-for="(row, i) in rows" :key="i">
                    <th v-for="(cell, j) in Object.values(row)" :key="j">{{ cell }}</th>
                </tr>
            </table>
        </UCard>
    </div>
</template>
