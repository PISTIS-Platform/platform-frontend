<script setup lang="ts">
const appConfig = useAppConfig();

useHead({
    titleTemplate: (title) => `${title ? title + ' • ' : ''}${appConfig.name}`,
    htmlAttrs: { class: 'h-full bg-neutral-50' },
});
</script>

<template>
    <NuxtLoadingIndicator :throttle="100" :height="4" :color="appConfig.theme.loading" />
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>

    <UNotifications />
</template>

<style>
.placeholder_rect {
    border-radius: 10px;
    background: repeating-linear-gradient(135deg, #999 0px, #999 1px, white 1px, white 5px);
    border: #999 solid;
    border-width: 1px;
}
</style>
