<script setup lang="ts">
const _props = defineProps<{
    searchAction: (...args: any[]) => any;
}>();

const searchInput = defineModel<string>();
</script>

<template>
    <div class="mt-[5px] flex-none px-6 pb-10">
        <section name="top" class="flex flex-col">
            <form class="flex gap-3" @submit.prevent="searchAction">
                <SearchInput
                    v-model="searchInput"
                    class="w-full max-w-[50rem] ring-gray-200 ring-1 shadow rounded-md"
                    :placeholder="$t('searchBar.searchBarPlaceholder')"
                    :select-options="[]"
                />
                <KButton type="submit">
                    {{ $t('searchBar.searchButton') }}
                </KButton>
            </form>
        </section>
    </div>
</template>
