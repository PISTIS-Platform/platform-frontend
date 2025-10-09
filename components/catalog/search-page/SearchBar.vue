<script setup lang="ts">
const _props = defineProps<{
    searchAction: (...args: any[]) => any;
    searchDataAction: (...args: any[]) => any;
    searchTypeSelector: { type: boolean; default: false };
}>();

const searchInput = defineModel<string>();
const searchType = defineModel<string>('search-type');
const formAction = () => {
    if (searchType.value === 'data') {
        return _props.searchDataAction();
    }
    return _props.searchAction();
};
</script>

<template>
    <div class="mt-[5px] w-full px-6">
        <section name="top" class="flex flex-col">
            <form @submit.prevent="formAction">
                <div class="flex gap-3">
                    <SearchInput
                        v-model="searchInput"
                        class="w-full ring-gray-200 ring-1 shadow rounded-md text-sm"
                        :placeholder="$t('searchBar.searchBarPlaceholder')"
                        size="small"
                        :select-options="[]"
                    />
                    <UButton type="submit" size="sm">{{ $t('searchBar.searchButton') }}</UButton>
                </div>
                <div v-if="searchTypeSelector" class="flex pt-4 px-2">
                    <SearchType v-model:search-type="searchType" />
                </div>
                <!-- <KButton type="submit">
{{ $t('searchBar.searchButton') }}
</KButton> -->
            </form>
        </section>
    </div>
</template>
