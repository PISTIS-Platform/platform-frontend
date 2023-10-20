<template>
    <div class="w-full h-full">
        <Heading :title="$t('data.designer')" />
        <div class="flex gap-4 items-center mt-8">
            <USelectMenu
                v-model="selected"
                icon="i-heroicons-magnifying-glass-20-solid"
                searchable
                searchable-placeholder="Search for a dataset..."
                class="w-full lg:w-72 relative"
                placeholder="Select / search for a dataset"
                :options="selections"
            />
            <UButton label="File Browser" />
        </div>
    </div>
</template>

<script setup lang="ts">
import dummyData from './dummy-data';

const selections = Object.keys(dummyData);

const selected = ref<string>('');
</script>
