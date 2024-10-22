<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
const { data, status } = useFetch<any[]>('/api/data-transformation/transformation');

const transformations = computed(() => {
    if (!data.value) return [];

    return data.value.map((item) => ({
        label: item.properties.id.const
            .replace(/_/g, ' ')
            .replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase()),
        content: item,
    }));
});

const { copy, copied } = useClipboard();
</script>

<template>
    <UAccordion v-if="status === 'success'" variant="soft" size="sm" :items="transformations">
        <template #item="{ item }">
            <div class="bg-neutral-100 ml-4 rounded-md border border-neutral-200 p-4 relative">
                <UButton
                    icon="i-heroicons-document-duplicate"
                    size="sm"
                    variant="ghost"
                    square
                    class="absolute top-0 right-0"
                    @click="copy(JSON.stringify(item.content, null, 2))"
                    >{{ copied ? 'Copied' : '' }}</UButton
                >
                <pre class="relative">{{ item }}</pre>
            </div>
        </template>
    </UAccordion>
</template>
