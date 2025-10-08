import { toRef, watch } from 'vue';

import { useSearchParams } from './useSearchParams';

export function useSearchInput(options) {
    const searchInput = toRef((options?.searchInput || '') as string);
    const searchType = toRef((options?.searchType || 'metadata') as string);
    const { queryParams } = options?.searchParams ? options.searchParams : useSearchParams();
    watch(
        () => queryParams.q.value,
        (val) => {
            searchInput.value = val;
        },
        { immediate: true },
    );
    watch(
        () => queryParams.qt.value,
        (val) => {
            searchType.value = val;
        },
        { immediate: true },
    );

    function doSearch() {
        if (queryParams.q.value === searchInput.value && queryParams.qt.value === searchType.value) return;
        queryParams.q.value = searchInput.value;
        queryParams.qt.value = searchType.value;
        queryParams.page.value = 0;
    }

    return { searchInput, searchType, doSearch };
}
