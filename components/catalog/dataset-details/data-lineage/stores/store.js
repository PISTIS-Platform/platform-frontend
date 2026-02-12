import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useApiService } from '~/services/apiService';

const pistisMode = ref('');
const backendUrl = ref('');
const datasetFactoryUrl = ref('');

const setPistisMode = (mode) => {
    pistisMode.value = mode;
};

const { getDatasetDiffUrl, getDatasetDiffUrlLimited, getLineageDataUrl } = useApiService(pistisMode);

const setBackendUrl = (url) => {
    backendUrl.value = 'https://' + url;
};

const setDatasetFactoryUrl = (url) => {
    datasetFactoryUrl.value = url ? 'https://' + url : '';
};

export const useStore = defineStore('store', () => {
    // ========================================
    // STATE DEFINITIONS
    // ========================================

    // UI State
    const selectedOption = ref('dataset-history');
    const isCompareVisible = ref(false);
    const displayState = ref('tracker');

    // Configuration State
    // const navigation = ref(config.navigation);
    // const subNav = ref(config.subNav);
    // const keycloak = ref(config.keycloak);

    // Dataset State
    const familyTreeData = ref(null);
    const lineageFamilyID = ref(null);
    const treeObject = ref(null);
    const tableData = ref(null);
    const selectedDiff = ref([]);

    // Comparison State
    const diffData = ref(null);
    const isLoadingDiff = ref(false);
    const diffError = ref(null);

    // Loading States
    const isLoadingFamilyTree = ref(false);

    // External Store Dependencies
    // const authStore = useAuthStore();

    // ========================================
    // DIFF MANAGEMENT ACTIONS
    // ========================================

    const addToDiff = (diffID) => {
        if (selectedDiff.value.length === 2) {
            // Replace previous selections with new node
            selectedDiff.value = [diffID];
        } else {
            // Add node to selection
            selectedDiff.value.push(diffID);

            if (selectedDiff.value.length === 2) {
                isCompareVisible.value = true;
                displayState.value = 'diff';
                // Auto-fetch diff data when two datasets are selected
                fetchDatasetDiff();
            }
        }
    };

    const resetDiff = () => {
        selectedDiff.value = [];
        diffData.value = null;
        diffError.value = null;
    };

    const toggleCompareVisibility = () => {
        isCompareVisible.value = !isCompareVisible.value;
    };

    // ========================================
    // API ACTIONS
    // ========================================

    const fetchDatasetDiff = async () => {
        const [id1, id2] = selectedDiff.value;

        if (!id1 || !id2) {
            const errorMessage = 'Two datasets must be selected for comparison';
            console.error(errorMessage);
            diffError.value = errorMessage;
            return;
        }

        isLoadingDiff.value = true;
        diffError.value = null;

        const { data: session } = useAuth();
        const token = session.value?.token;

        try {
            const isCloud = pistisMode.value === 'cloud';

            // Use different endpoint and URL for cloud mode
            let url, requestConfig;
            if (isCloud) {
                // Cloud mode: use dataset factory URL with limited diff endpoint (no authentication required)
                url = getDatasetDiffUrlLimited(datasetFactoryUrl.value);
                requestConfig = {
                    params: {
                        uuid_1: id1,
                        uuid_2: id2,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                };
            } else {
                // Factory mode: use backend URL with full diff endpoint (requires authentication)
                url = getDatasetDiffUrl(backendUrl.value);
                requestConfig = {
                    params: {
                        uuid_1: id1,
                        uuid_2: id2,
                        is_cloud: false,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                };
            }

            const response = await axios.get(url, requestConfig);

            diffData.value = response.data;

            if (import.meta.env.DEV) {
                console.log('Dataset comparison data received:', diffData.value);
            }
        } catch (error) {
            console.error('Error fetching dataset comparison data:', error);
            diffError.value = error.response?.data?.message || 'Failed to fetch comparison data';
        } finally {
            isLoadingDiff.value = false;
        }
    };

    const extractFamilyId = (data) => {
        if (!data || typeof data !== 'object') {
            return null;
        }

        for (const lineageGroup of Object.values(data)) {
            if (!lineageGroup || typeof lineageGroup !== 'object') {
                continue;
            }

            for (const datasetEvents of Object.values(lineageGroup)) {
                // Each dataset can have multiple events (array) or a single event (object)
                // Convert to array format for consistent processing
                const records = Array.isArray(datasetEvents) ? datasetEvents : [datasetEvents];

                for (const record of records) {
                    if (record && typeof record === 'object' && record.family_id) {
                        return record.family_id;
                    }
                }
            }
        }

        return null;
    };

    const fetchData = async (lineageID, token) => {
        isLoadingFamilyTree.value = true;
        lineageFamilyID.value = null;

        if (!token) {
            console.error('No access token found');
            isLoadingFamilyTree.value = false;
            return;
        }

        try {
            const url = getLineageDataUrl(backendUrl.value);

            const response = await axios.get(url, {
                params: {
                    uuid: lineageID,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            const responseData = response.data;
            treeObject.value = responseData;
            familyTreeData.value = responseData;
            lineageFamilyID.value = extractFamilyId(responseData);
            parseTableData(responseData);

            if (import.meta.env.DEV) {
                console.log('Family tree API response:', responseData);
            }
        } catch (error) {
            console.error('Family tree API request failed:', error);
        } finally {
            isLoadingFamilyTree.value = false;
        }
    };

    const compareDatasets = async (id1, id2) => {
        if (!id1 || !id2) {
            console.error('Two valid dataset IDs must be provided for comparison');
            return;
        }

        // Update selected datasets and UI state
        selectedDiff.value = [id1, id2];
        isCompareVisible.value = true;
        displayState.value = 'diff';

        // Fetch comparison data
        return fetchDatasetDiff();
    };

    // ========================================
    // DATA PROCESSING UTILITIES
    // ========================================

    // Helper function to transform activity to display text
    const transformActivityToDisplay = (operation) => {
        const operationUpper = String(operation).toUpperCase();
        if (operationUpper === 'CREATE') {
            return 'DATASET REGISTERED';
        } else if (operationUpper === 'UPDATE') {
            return 'DATASET UPDATED';
        }
        return operation || 'Unknown';
    };

    const parseTableData = (apiData) => {
        const tempVersionedObject = {};

        // Process each lineage group
        for (const lineageId in apiData) {
            const lineageGroup = apiData[lineageId];

            for (const datasetId in lineageGroup) {
                const datasetEvents = lineageGroup[datasetId];

                // Each dataset can have multiple events (array) or a single event (object)
                // Convert to array format for consistent processing
                const records = Array.isArray(datasetEvents) ? datasetEvents : [datasetEvents];

                records.forEach((record, index) => {
                    // Create unique row ID by appending event index to dataset UUID
                    // Example: "737ad274-ae97-4cb5-aad2-e3cde541771f-0", "737ad274-ae97-4cb5-aad2-e3cde541771f-1"
                    const rowId = `${datasetId}-${index}`;

                    // Combine user_group and username into display string
                    // Remove leading slash from user_group if present
                    const userGroup = record.user_group?.startsWith('/')
                        ? record.user_group.substring(1)
                        : record.user_group;
                    const userDisplay = userGroup ? `${userGroup} ${record.username}` : record.username;

                    // Add description for CREATE operations
                    const operationUpper = String(record.operation).toUpperCase();
                    let activityDescription = null;
                    if (operationUpper === 'CREATE') {
                        activityDescription =
                            'Dataset was successfully ingested via the Job Configurator and registered in the Factory Catalog.';
                    }

                    // Handle timestamp override for GDPR Check
                    let displayTimestamp = record.timestamp;
                    if (
                        record.operation?.toLowerCase() === 'gdpr check' &&
                        record.operation_description &&
                        record.operation_description.timestamp
                    ) {
                        displayTimestamp = record.operation_description.timestamp;
                    }

                    tempVersionedObject[rowId] = {
                        id: rowId,
                        dataset_id: datasetId,
                        version: record.version,
                        activity: transformActivityToDisplay(record.operation),
                        activity_description: activityDescription,
                        operation_description: record.operation_description,
                        username: userDisplay,
                        timestamp: formatDate(displayTimestamp),
                        family_id: record.family_id,
                        dataset_name: record.dataset_name,
                        visibility_status: record.visibility_status,
                        derived_from: record.derived_from,
                    };
                });
            }
        }

        // Sort by version (descending)
        const sortedKeys = Object.keys(tempVersionedObject).sort((a, b) => {
            return tempVersionedObject[b].version - tempVersionedObject[a].version;
        });

        // Create sorted object
        const sortedTableData = {};
        sortedKeys.forEach((key) => {
            sortedTableData[key] = tempVersionedObject[key];
        });

        tableData.value = sortedTableData;
    };

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    const capitalizeFirstLetter = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';

        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    const selectTableFilter = (option) => {
        selectedOption.value = option;
    };

    // ========================================
    // STORE RETURN (PUBLIC API)
    // ========================================

    return {
        // State
        selectedOption,
        isCompareVisible,
        displayState,
        // navigation,
        // subNav,
        // keycloak,
        familyTreeData,
        lineageFamilyID,
        treeObject,
        tableData,
        selectedDiff,
        diffData,
        isLoadingDiff,
        isLoadingFamilyTree,
        diffError,

        // Actions
        setPistisMode,
        addToDiff,
        resetDiff,
        toggleCompareVisibility,
        fetchData,
        fetchDatasetDiff,
        compareDatasets,
        parseTableData,
        selectTableFilter,
        setBackendUrl,
        setDatasetFactoryUrl,

        // Utilities (exposed for components that need them)
        capitalizeFirstLetter,
        formatDate,
    };
});
