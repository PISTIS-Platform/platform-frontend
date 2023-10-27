<script lang="ts" setup>
const props = defineProps({
    title: {
        type: String,
        required: false,
        default: '',
    },
});
</script>

<template>
    <div class="flex flex-col py-6 justify-start items-start px-8 flex-1 max-w-6xl mx-auto w-full">
        <Heading v-if="props.title" :title="$t('admin.services.title')" />

        <slot />
    </div>
</template>
