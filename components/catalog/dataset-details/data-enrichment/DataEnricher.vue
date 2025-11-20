<template>
    <div>
        <h1 class="text-center text-2xl font-bold text-primary-600 mb-16">
            Select columns properties to change the schema
        </h1>

        <div class="flex justify-between items-center">
            <UButton v-if="!isValidated" variant="outline" size="md" color="primary" @click="resetAll">
                Reset values
            </UButton>
            <UButton v-else variant="outline" size="md" color="primary" @click="() => (isValidated = false)">
                Adjust properties
            </UButton>

            <div v-if="isValidated" class="flex gap-2 items-center">
                <UInput v-model="fileName" size="md" placeholder="Enter distribution name" class="w-48" />
                <UButton
                    v-if="isValidColumnChoices && fileName"
                    size="md"
                    color="secondary"
                    :loading="store.savingIsLoading"
                    @click="store.saveAsset(fileName)"
                >
                    Clean and save dataset
                </UButton>
                <UTooltip
                    v-else
                    text="A distribution name must be provided before saving"
                    :ui="{ width: 'max-w-2xl', base: 'text-wrap' }"
                >
                    <UButton size="md" color="secondary" disabled> Clean and save dataset </UButton>
                </UTooltip>
            </div>
            <div v-if="!isValidated" class="flex items-center">
                <UButton v-if="isValidColumnChoices" size="md" color="secondary" @click="callValidateAsset(fileName)">
                    Validate dataset
                </UButton>
                <UTooltip
                    v-else
                    text="All property choices need to be valid before saving"
                    :ui="{ width: 'max-w-2xl', base: 'text-wrap' }"
                >
                    <UButton size="md" color="secondary" disabled> Validate dataset </UButton>
                </UTooltip>
            </div>
        </div>

        <UAlert
            v-if="validateResponseMessage"
            class="mt-3"
            variant="outline"
            title="Validation notes"
            :description="validateResponseMessage"
            icon="i-lucide-terminal"
        />
        <div class="py-4 flex justify-center">
            <UCard class="table-container mb-6 w-full overflow-hidden shadow-lg">
                <div class="overflow-x-auto rounded-lg shadow-md">
                    <table class="w-full bg-white">
                        <tr v-show="!isValidated">
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
                        <tr v-show="isValidated">
                            <td
                                v-for="(column, index) in dataColumns"
                                :key="index"
                                class="p-4 border border-gray-200 min-w-[175px]"
                            >
                                <div class="font-semibold">
                                    {{ column.name }}
                                </div>
                                <div class="">
                                    {{ column.propertyName ? column.propertyName : column.name }}
                                    <span class="text-secondary-400">
                                        {{ column.dataType }}
                                    </span>
                                </div>
                            </td>
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

const store = useDataEnrichmentStore();

const selected = ref(false);
const fileName = ref('');
const columnRefs = ref([]);

const isValidated = ref(false);
const validateResponse = ref({});
const validateResponseMessage = computed(() => validateResponse.value?.message);
const _validateResponseStatusCode = computed(() => validateResponse.value?.status_code);

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

const callValidateAsset = async (fileName) => {
    validateResponse.value = await store.validateAsset(fileName);
    isValidated.value = true;
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
