<script setup lang="ts">
const props = defineProps<{ tableData: any }>();
const sorted = computed(() => props.tableData.table_schema.column.slice().sort((a, b) => a.column_id - b.column_id));

function shortDataType(dataType?: string): string {
    if (!dataType) return 'unknown';
    return dataType.split('#').pop() ?? dataType;
}
</script>

<template>
    <div class="w-full max-h-[400px] overflow-x-auto overflow-y-auto border">
        <table class="border-collapse w-max min-w-full">
            <tr>
                <th
                    v-for="column in sorted"
                    :key="column.column_id"
                    class="border px-3 py-2 text-left text-xs text-gray-600 min-w-[200px] whitespace-nowrap"
                >
                    {{ column.column_name }}
                </th>
            </tr>
            <tr>
                <td
                    v-for="col in sorted"
                    :key="col.column_id"
                    class="border px-3 py-2 align-top text-gray-600 text-sm min-w-[200px]"
                >
                    <div>
                        {{ col.property_name }}
                        <span class="font-extralight">{{ shortDataType(col.data_type) }}</span>
                    </div>
                    <div class="text-xs text-gray-500 break-all">
                        {{ col.property_URI }}
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>
