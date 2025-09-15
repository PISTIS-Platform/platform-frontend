<script setup lang="ts"></script>

<template>
    <UAlert
        icon="fluent:warning-28-filled"
        color="primary"
        variant="soft"
        :title="$t('data.designer.noDatasetSelected')"
        :description="$t('data.designer.pleaseSelectFromCatalog')"
    />
</template>
