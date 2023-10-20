<template>
    <div class="w-full h-full">
        <Heading :title="$t('data.designer')" />
        <USelectMenu
            v-model="selected"
            searchable
            searchable-placeholder="Search a dataset..."
            class="w-full mt-8 lg:w-60"
            placeholder="Select a dataset"
            :options="selections"
        />
    </div>
</template>

<script setup lang="ts">
import dummyData from './dummy-data';

const selections = Object.keys(dummyData);

const selected = ref<string>('');
</script>
