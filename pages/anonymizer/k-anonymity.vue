<script setup>
import { useI18n } from 'vue-i18n';

import Title from '../../components/anonymizer/Title.vue';

const { t } = useI18n();

const title = `${t('anonymizer.anonymizer')} - ${t('anonymizer.kAnonymity')}`;
</script>

<template>
    <Title :title="title" />
</template>
