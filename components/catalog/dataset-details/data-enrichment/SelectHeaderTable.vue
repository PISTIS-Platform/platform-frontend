<template>
    <div>
        <h1 class="text-center text-2xl font-bold text-primary-600 mb-16">Select table header</h1>

        <div class="flex justify-between items-center">
            <UButton variant="outline" color="gray" size="md" icon="i-heroicons-plus" @click="selectHeader('down')">
                Add a new table header
            </UButton>

            <UButton color="primary" size="md" icon="i-heroicons-check" @click="selectHeader('up')">
                Confirm table header
            </UButton>
        </div>

        <div class="py-4 flex justify-center">
            <UCard class="w-full overflow-hidden shadow-lg">
                <div class="overflow-x-auto rounded-lg">
                    <table class="w-full border-collapse bg-white text-center">
                        <thead>
                            <tr>
                                <th
                                    v-for="(column, index) in dataColumns"
                                    :key="index"
                                    class="border border-dashed border-black bg-secondary-200 bg-opacity-50 p-4 font-medium"
                                >
                                    {{ column.name }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(row, rowIndex) in dataRows"
                                :key="rowIndex"
                                class="hover:bg-gray-50 transition-colors"
                            >
                                <td
                                    v-for="(rowData, cellIndex) in row"
                                    :key="cellIndex"
                                    class="border border-gray-200 p-4"
                                >
                                    {{ rowData }}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td
                                    v-for="(column, index) in store.initialFileData?.data_model?.columns"
                                    :key="index + 'f'"
                                    class="border border-gray-200 p-4 text-gray-500 italic"
                                >
                                    ...
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup>
import { useDataEnrichmentStore } from '~/store/dataEnrichment';

const props = defineProps({
    toggleHeaderChosen: {
        type: Function,
        required: true,
    },
});

const store = useDataEnrichmentStore();

const dataRows = computed(() => store.initialFileData?.data?.rows.slice(0, 5));
const dataColumns = computed(() => store.initialFileData?.data_model?.columns);

const headerChosen = ref(false);
const datasetId = ref(null);

onMounted(() => {
    if (process.client) {
        datasetId.value = localStorage.getItem('datasetId');
    }
});

const selectHeader = (option) => {
    store.fetchOptions();
    props.toggleHeaderChosen();
    headerChosen.value = true;
    if (option === 'down') {
        store.pushFirstHeaderRowDown();
    }
};
</script>

<style scoped>
.font-montserrat {
    font-family: 'Montserrat', sans-serif;
}

table {
    border-spacing: 0;
}

thead tr {
    border-radius: 15px;
}
</style>
