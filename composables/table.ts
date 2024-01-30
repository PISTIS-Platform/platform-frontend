export const useTable = <T>(pageCount: number = 10, startingPage: number = 1) => {
    //Table data
    const tableData = ref<T[]>([]);

    // Pagination
    const page = ref<number>(startingPage);

    //paginated rows
    const paginatedRows = computed(() => {
        return tableData.value.slice((page.value - 1) * pageCount, page.value * pageCount);
    });

    // Searchable table
    const searchString = ref<string>('');

    const filteredRows = computed(() => {
        if (!searchString.value) {
            return paginatedRows.value;
        } else {
            return (paginatedRows.value as T[]).filter((item: T) => {
                return Object.values(item as Record<string, unknown>).some((value: unknown) => {
                    return String(value).toLowerCase().includes(searchString.value.toLowerCase());
                });
            });
        }
    });

    return {
        page,
        searchString,
        tableData,
        filteredRows,
    };
};
