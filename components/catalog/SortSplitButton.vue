<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import PhArrowDown from '~icons/ph/arrow-down';
import PhArrowUp from '~icons/ph/arrow-up';

const { t } = useI18n();
const showDropdown = ref(false);
const sortDirection = defineModel<string>('direction', { default: 'desc' });

const checked = computed({
    get() {
        return sortDirection.value === 'asc';
    },
    set(value: boolean) {
        sortDirection.value = value ? 'asc' : 'desc';
    },
});

const sortOptions = computed(() => [
    { name: t('SortSplitButton.sortOptions.modified'), id: 'modified' },
    { name: t('SortSplitButton.sortOptions.relevance'), id: 'relevance' },
    { name: t('SortSplitButton.sortOptions.title'), id: 'title.de' },
    { name: t('SortSplitButton.sortOptions.issued'), id: 'issued' },
]);
const sort = defineModel<string>('sort', { default: 'modified' });

const selectedOption = computed(() => sortOptions.value.find((opt) => opt.id === sort.value)?.name ?? '');

function toggleDropdown() {
    showDropdown.value = !showDropdown.value;
}

function selectOption(id: string) {
    sort.value = id;
}

function toggle() {
    checked.value = !checked.value;
}
</script>

<template>
    <div class="relative w-full flex">
        <div
            class="relative rounded-r-none md:w-56 inline-flex bg-white ring-gray-200 ring-1 shadow rounded-md cursor-pointer"
        >
            <button class="flex-auto font-light px-3 py-2 flex items-center justify-between" @click="toggleDropdown">
                {{ selectedOption }}
                <i class="icon-[ph--caret-down] text-surface-text text-xs" />
            </button>

            <div
                v-if="showDropdown"
                class="absolute z-10 w-full top-full border dark:border rounded-md shadow-md bg-white dark:bg-surface-800 text-surface-800 dark:text-white/80 dark:border-surface-700 max-h-[200px] py-3"
            >
                <ul v-for="option in sortOptions" :key="option.id" :value="option.id">
                    <li
                        class="leading-none m-0 py-3 px-5 font-light dark:bg-primary-400/40 text-black dark:text-white/80 cursor-pointer hover:bg-pistis-100"
                        :class="{ 'bg-pistis-200': option.id === sort }"
                        @click="selectOption(option.id, option.name)"
                    >
                        {{ option.name }}
                    </li>
                </ul>
            </div>
        </div>

        <button
            class="rounded-l-none pl-3 pr-4 cursor-pointer bg-white ring-gray-200 ring-1 shadow rounded-md font-light flex items-center"
            @click="toggle"
        >
            <component
                :is="sortDirection === 'asc' ? PhArrowUp : PhArrowDown"
                class="mr-2 text-surface-text !text-xs"
            />
            {{ checked ? t('SortSplitButton.toggleButton.ascending') : t('SortSplitButton.toggleButton.descending') }}
        </button>
    </div>
</template>

<style scoped></style>
