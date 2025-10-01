import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import mockData from './mock-lineage.json';

const pistisMode = ref('');
const backendUrl = ref('');

const setPistisMode = (mode) => {
    pistisMode.value = mode;
};

const setBackendUrl = (url) => {
    backendUrl.value = 'https://' + url;
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
            const url = `${backendUrl.value}/srv/lineage-tracker/get_datasets_diff`;
            const isCloud = pistisMode.value === 'cloud';

            const response = await axios.get(url, {
                params: {
                    uuid_1: id1,
                    uuid_2: id2,
                    is_cloud: isCloud,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            diffData.value = response.data;

            // working with mockdata
            // const response = mockCompare;
            // diffData.value = response;

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

    const fetchData = async (lineageID, token) => {
        isLoadingFamilyTree.value = true;

        if (!token) {
            console.error('No access token found');
            return;
        }

        try {
            const url = `${backendUrl.value}/srv/lineage-tracker/get_dataset_family_tree`;

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

    //Mock Data
    const loadMockData = async () => {
        try {
            const response = mockData;
            treeObject.value = response;
            familyTreeData.value = response;
            parseTableData(treeObject.value);
            console.log('Mock Data used:', response);
        } catch (error) {
            console.error('Loading mock data failed:', error);
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

            for (const recordId in lineageGroup) {
                const record = lineageGroup[recordId];

                // Combine user_group and username into display string
                const userDisplay = record.user_group ? `${record.user_group} ${record.username}` : record.username;

                // Add description for CREATE operations
                const operationUpper = String(record.operation).toUpperCase();
                let activityDescription = null;
                if (operationUpper === 'CREATE') {
                    activityDescription =
                        'Dataset was successfully ingested via the Job Configurator and registered in the Factory Catalog.';
                }

                tempVersionedObject[recordId] = {
                    id: recordId,
                    version: record.version,
                    activity: transformActivityToDisplay(record.operation),
                    activity_description: activityDescription,
                    operation_description: record.operation_description,
                    username: userDisplay,
                    timestamp: formatDate(record.timestamp),
                };
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
        loadMockData,
        setBackendUrl,

        // Utilities (exposed for components that need them)
        capitalizeFirstLetter,
        formatDate,
    };
});
