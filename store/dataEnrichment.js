import { defineStore } from 'pinia';

export const useDataEnrichmentStore = defineStore('dataEnrichment', () => {
    // Get runtime config and other Nuxt composables
    const config = useRuntimeConfig();
    // const router = useRouter();
    // const router = useRouter();

    const { data: session } = useAuth();

    const token = ref(session.value?.token);

    // URLs from runtime config
    const catalogueUrl = ref(config.public.factoryUrl + '/catalog/dataset-details/');
    const apiUrl = ref(config.public.factoryUrl + '/srv/data-enrichment-backend');

    // State
    const fileData = ref({});
    const initialFileData = ref(null);
    const unsupportedDataTypes = ref(new Map([['Bigint', 'Integer']]));
    const dataTypeTransformCompatibility = ref({
        String: new Set(['string', 'date', 'dateTime']),
        Integer: new Set(['string', 'integer', 'double', 'float', 'int']),
        Double: new Set(['string', 'integer', 'double']),
        Float: new Set(['string', 'float']),
        Date: new Set(['string', 'date', 'dateTime']),
        DateTime: new Set(['string', 'date', 'dateTime']),
    });
    const changedUnsupportedDataTypes = ref(new Map());
    const liveSearchResult = ref([]);
    const isValidColumnChoices = ref(false);
    const columnsStatus = ref([]);
    const datasetId = ref(null);
    const distributionId = ref(null);
    const type = ref(null);
    const savingIsLoading = ref(false);

    const toast = useToast();

    // Setters
    const setDatasetId = (id) => {
        datasetId.value = id;
    };

    const setDistributionId = (id) => {
        distributionId.value = id;
    };

    const setFileType = (id) => {
        type.value = id;
    };

    // GET -> file
    async function selectFile() {
        try {
            const response = await $fetch('/get_asset', {
                baseURL: apiUrl.value,
                params: {
                    dataset_id: datasetId.value,
                    distribution_id: distributionId.value,
                    file_type: type.value,
                },
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            initialFileData.value = JSON.parse(JSON.stringify(response));
            fileData.value = response;
            checkUnsupportedDatatypes(response.data_model?.columns);
        } catch (e) {
            if (process.dev) {
                console.warn('Using mock data in development mode!');
                // Import mock data (you'll need to move this to a composable or utils)
                const { mockData } = await import('~/utils/mockData.js');
                initialFileData.value = mockData;
                fileData.value = mockData;
                checkUnsupportedDatatypes(mockData.data_model?.columns);
            } else {
                console.error(e);
                const errorMessage =
                    typeof e.data === 'string' ? e.data : e.data?.message || e.message || "File couldn't be selected.";

                toast.add({
                    title: errorMessage,
                    icon: 'i-lucide-x-circle',
                    color: 'red',
                });
                // await router.push('/');
            }
        }
    }

    // POST update data-model
    const updateDataModel = async () => {
        try {
            await $fetch('/update_datamodel', {
                baseURL: apiUrl.value,
                method: 'POST',
                timeout: 15000,
            });
        } catch (e) {
            console.error(e.message);
            const errorMessage =
                typeof e.data === 'string'
                    ? e.data
                    : e.data?.message || e.message || 'The latest datamodel could not be fetched.';

            toast.add({
                title: errorMessage,
                icon: 'i-lucide-x-circle',
                color: 'red',
            });
        }
    };

    // POST fetch Live search options
    const fetchOptions = async () => {
        try {
            const response = await $fetch('/livesearch_data_model', {
                baseURL: apiUrl.value,
                method: 'POST',
                body: {
                    sequence: '',
                },
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });
            liveSearchResult.value = response.properties;
        } catch (e) {
            const errorMessage =
                typeof e.data === 'string'
                    ? e.data
                    : e.data?.message || e.message || 'Live search options could not be fetched.';

            toast.add({
                title: errorMessage,
                icon: 'i-lucide-x-circle',
                color: 'red',
            });
            // await router.push('/');
            console.error(e);
        }
    };

    // POST Save Asset
    const saveAsset = async (fileName) => {
        revertUnsupportedDataTypes();

        const requestData = {
            metadata: {
                id: datasetId.value,
            },
            data_model: {
                columns: fileData.value.data_model.columns,
            },
        };

        try {
            const response = await $fetch('/save_asset', {
                baseURL: apiUrl.value,
                method: 'POST',
                body: requestData,
                params: {
                    dataset_id: datasetId.value,
                    distribution_id: distributionId.value,
                    file_name: fileName,
                },
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            savingIsLoading.value = false;

            toast.add({
                title: response,
                color: 'green',
            });

            if (datasetId.value && process.client) {
                setTimeout(() => {
                    window.location.href = `${catalogueUrl.value}${datasetId.value}?pm=factory`;
                }, 3000);
            }
        } catch (e) {
            savingIsLoading.value = false;
            const errorMessage =
                typeof e.data === 'string' ? e.data : e.data?.message || e.message || "Dataset couldn't be saved.";

            toast.add({
                title: errorMessage,
                icon: 'i-lucide-x-circle',
                color: 'red',
            });

            // await router.push('/');
            console.error(e);
        }
    };

    const validateAsset = async (fileName) => {
        savingIsLoading.value = true;

        const requestData = {
            metadata: {
                distributionId: distributionId.value,
            },
            data_model: {
                columns: fileData.value.data_model.columns,
            },
        };

        try {
            const _response = await $fetch('/validate_dataset', {
                baseURL: apiUrl.value,
                method: 'POST',
                body: requestData,
                params: {
                    dataset_id: datasetId.value,
                    distribution_id: distributionId.value,
                    file_name: fileName,
                },
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            await saveAsset(fileName);
        } catch (e) {
            savingIsLoading.value = false;
            console.log('Fetch error:', e);

            const errorMessage =
                typeof e.data === 'string' ? e.data : e.data?.message || e.message || 'Validation failed';

            toast.add({
                title: errorMessage,
                icon: 'i-lucide-x-circle',
                color: 'red',
            });
        }
    };

    const checkUnsupportedDatatypes = (payload) => {
        const containsUnsupportedTypes = payload.some((item) => unsupportedDataTypes.value.has(item.dataType));

        if (containsUnsupportedTypes) {
            payload.forEach((e, index) => {
                if (unsupportedDataTypes.value.has(e.dataType)) {
                    const originalType = e.dataType;
                    const updatedType = unsupportedDataTypes.value.get(e.dataType);
                    fileData.value.data_model.columns[index].dataType = updatedType;
                    changedUnsupportedDataTypes.value.set(index, { originalType, updatedType });
                }
            });
        }
    };

    const revertUnsupportedDataTypes = () => {
        if (changedUnsupportedDataTypes.value.size) {
            for (const [index, change] of changedUnsupportedDataTypes.value.entries()) {
                const { originalType } = change;
                unsupportedDataTypes.value.forEach((value, key) => {
                    if (
                        originalType?.trim().toLowerCase() === key?.trim().toLowerCase() &&
                        fileData.value.data_model.columns[index].dataType?.trim().toLowerCase() ===
                            value?.trim().toLowerCase()
                    ) {
                        fileData.value.data_model.columns[index].dataType = originalType;
                    }
                });
            }
        }
    };

    const selectColumn = ({ id, selectedColumn }) => {
        if (Object.keys(selectedColumn).length !== 0) {
            fileData.value.data_model.columns[id] = selectedColumn;
        }
    };

    const setColumnStatus = (status) => {
        updateColumnStatus(status);
        updateStatus();
    };

    const updateColumnStatus = (payload) => {
        const index = columnsStatus.value.findIndex((status) => status.id === payload.id);
        if (index !== -1) {
            // If the column status object exists, update it
            columnsStatus.value[index] = payload;
        } else {
            // Otherwise, add the new column status object to the array
            columnsStatus.value.push(payload);
        }
    };

    const updateStatus = () => {
        if (columnsStatus.value.length === fileData.value.data_model.columns.length) {
            const isEveryObjectValid = columnsStatus.value.every((obj) => {
                // get an array of all keys except 'id' and 'name'
                const keys = Object.keys(obj).filter((key) => key !== 'id' && key !== 'name');
                // check that every property except 'id' is true
                return keys.every((key) => obj[key] === true);
            });
            isValidColumnChoices.value = isEveryObjectValid;
        }
    };

    const pushFirstHeaderRowDown = () => {
        const names = fileData.value.data_model.columns.map((column) => column.name);
        fileData.value.data.rows = [[...names], ...fileData.value.data.rows];
        fileData.value.data_model.columns.forEach((column) => {
            column.name = '';
        });
    };

    const restoreOriginalFileData = () => {
        fileData.value = JSON.parse(JSON.stringify(initialFileData.value));
    };

    return {
        // State
        dataTypeTransformCompatibility,
        initialFileData,
        liveSearchResult,
        isValidColumnChoices,
        columnsStatus,
        fileData,
        datasetId,
        distributionId,
        type,

        // Actions
        selectFile,
        updateDataModel,
        fetchOptions,
        selectColumn,
        setColumnStatus,
        pushFirstHeaderRowDown,
        restoreOriginalFileData,
        saveAsset,
        validateAsset,
        setDatasetId,
        setDistributionId,
        setFileType,
        savingIsLoading,
    };
});
