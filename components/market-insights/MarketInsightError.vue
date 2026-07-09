<script setup lang="ts">
defineProps({
    message: {
        type: String,
        default: '',
    },
});

const { t } = useI18n();
</script>

<template>
    <UCard class="w-full">
        <div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-7 w-7 text-gray-400" />
            <p class="text-gray-500 text-sm">{{ message || t('market.overview.loadError') }}</p>
        </div>
    </UCard>
</template>
