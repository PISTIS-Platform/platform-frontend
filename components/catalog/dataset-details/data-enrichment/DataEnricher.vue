<template>
    <div>
        <h1 class="text-center text-2xl font-bold text-primary-600 mb-6">Select columns to change the schema</h1>

        <div class="flex justify-between items-center mt-4">
            <div class="flex gap-2">
                <UButton variant="outline" size="md" color="primary" @click.stop="backToHeader"> Back </UButton>
                <UButton variant="outline" size="md" color="primary" @click="resetAll"> Reset values </UButton>
            </div>

            <div class="flex gap-2 items-center">
                <UInput v-model="fileName" size="md" placeholder="Enter distribution name" class="w-48" />
                <UButton
                    v-if="isValidColumnChoices && fileName"
                    size="md"
                    color="secondary"
                    @click="store.validateAsset(fileName)"
                >
                    Save and create distribution
                </UButton>
                <UTooltip
                    v-else
                    text="A distribution name must be provided, and all property choices need to be fitting before saving"
                >
                    <UButton size="md" color="secondary" disabled> Save and create distribution </UButton>
                </UTooltip>
            </div>
        </div>

        <div class="py-4 flex justify-center">
            <UCard class="table-container mt-4 mb-6 w-full overflow-hidden shadow-lg">
                <div class="overflow-x-auto rounded-lg shadow-md">
                    <table class="w-full bg-white">
                        <tr>
                            <ColumnItem
                                v-for="(column, index) in dataColumns"
                                :id="index"
                                :key="index"
                                ref="columnRefs"
                                :column="column"
                                class="hover:bg-gray-50 transition-colors"
                                @selected="selected = true"
                            />
                        </tr>
                        <tr
                            v-for="(row, rowIndex) in dataRows"
                            :key="rowIndex"
                            class="hover:bg-gray-50 transition-colors"
                        >
                            <td v-for="(rowData, cellIndex) in row" :key="cellIndex" class="p-4 border border-gray-200">
                                {{ rowData }}
                            </td>
                        </tr>
                        <tfoot>
                            <tr>
                                <td
                                    v-for="(column, index) in dataColumns"
                                    :key="index + 'f'"
                                    class="ellipsis-cell p-4 border border-gray-200"
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
    datasetId: String,
    distributionId: String,
});

const store = useDataEnrichmentStore();

const selected = ref(false);
const fileName = ref('');
const columnRefs = ref([]);

const isValidColumnChoices = computed(() => store.isValidColumnChoices);
const fileData = computed(() => store.fileData);
const dataRows = computed(() => fileData.value.data?.rows.slice(0, 5));
const dataColumns = computed(() => fileData.value.data_model?.columns);

// Methods
const resetAll = () => {
    columnRefs.value.forEach((columnRef) => {
        if (columnRef && typeof columnRef.reset === 'function') {
            columnRef.reset();
        }
    });
};

const backToHeader = () => {
    store.restoreOriginalFileData();
    props.toggleHeaderChosen();
};

// onMounted(() => {
// });
</script>

<style scoped>
.table-container {
    font-family: 'Montserrat', sans-serif;
}

.ellipsis-cell {
    text-align: center;
    color: #6b7280;
}

table {
    border-spacing: 0;
    text-align: center;
}

th {
    border: 1px solid #e5e7eb;
    padding: 15px;
}

td {
    border: 0.1px solid #e5e7eb;
}
</style>
