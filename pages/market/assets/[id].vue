<script setup lang="ts">
import { useRoute } from 'nuxt/app';

// const { t } = useI18n();

const route = useRoute();

const assetID = route.params.id;
</script>

<template>
    {{ assetID }}
</template>
