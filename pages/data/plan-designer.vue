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
            <UButton label="File Browser" @click="showFileBrowser = !showFileBrowser" />
        </div>

        <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="transform opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="transform opacity-0"
        >
            <FileBrowser
                v-show="showFileBrowser"
                :files="selections"
                :selected="selected"
                class="mt-8"
                @selectionChanged="changeSelection"
            />
        </Transition>
    </div>
</template>

<script setup lang="ts">
import dummyData from './dummy-data';

const selections = Object.keys(dummyData);

const selected = ref<string>('');

const changeSelection = (value: string) => (selected.value = value);

const showFileBrowser = ref<boolean>(false);
</script>
