<script setup lang="ts">
const _props = defineProps<{
    searchAction: (...args: any[]) => any;
}>();

const searchInput = defineModel<string>();
</script>

<template>
    <div class="mt-[5px] w-full px-6">
        <section name="top" class="flex flex-col">
            <form class="flex gap-3" @submit.prevent="searchAction">
                <SearchInput
                    v-model="searchInput"
                    class="w-full ring-gray-200 ring-1 shadow rounded-md text-sm"
                    :placeholder="$t('searchBar.searchBarPlaceholder')"
                    size="small"
                    :select-options="[]"
                />
                <UButton type="submit" size="sm">{{ $t('searchBar.searchButton') }}</UButton>
                <!-- <KButton type="submit">
                    {{ $t('searchBar.searchButton') }}
                </KButton> -->
            </form>
        </section>
    </div>
</template>
