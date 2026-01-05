<script setup lang="ts">
const props = defineProps<{ tableData: any }>();
const sorted = computed(() => props.tableData.table_schema.column.slice().sort((a, b) => a.column_id - b.column_id));

function shortDataType(dataType?: string): string {
    if (!dataType) return 'unknown';
    return dataType.split('#').pop() ?? dataType;
}
</script>

<template>
    <div class="w-full max-h-[400px] overflow-auto border">
        <table class="min-w-full border-collapse">
            <tr>
                <th
                    v-for="column in sorted"
                    :key="column.column_id"
                    class="border px-2 text-left text-sm text-gray-600"
                >
                    {{ column.column_name }}
                </th>
            </tr>
            <tr>
                <td
                    v-for="col in sorted"
                    :key="col.column_id"
                    class="border px-2 py-1 align-top text-gray-600 text-base"
                >
                    <div>
                        {{ col.property_name }} <span class="font-extralight">{{ shortDataType(col.data_type) }}</span>
                    </div>
                    <div class="text-sm text-gray-500">{{ col.property_URI }}</div>
                </td>
            </tr>
        </table>
    </div>
</template>
