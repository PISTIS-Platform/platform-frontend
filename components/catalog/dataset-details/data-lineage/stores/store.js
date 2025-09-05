import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import mockCompare from './mock-compare.json';
import mockData from './mock-lineage.json';

const route = useRoute();
const pistisMode = route.query.pm;

const nuxtConfig = useRuntimeConfig();
let backendUrl = '';
if (pistisMode === 'factory') {
    backendUrl = nuxtConfig.public.factoryUrl;
} else {
    backendUrl = nuxtConfig.public.cloudUrl;
}

// Environment logging for debugging
if (import.meta.env.DEV) {
    console.log('Store Environment Config:', {
        // FACTORY_OR_CLOUD: import.meta.env.VITE_FACTORY_OR_CLOUD,
        BASE_API_HOST: import.meta.env.VITE_BASE_API_HOST,
        KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL,
        KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
        KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM,
        EXTERNAL_LOGIN_URL: import.meta.env.VITE_EXTERNAL_LOGIN_URL,
    });
}

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
        const _token = session.value?.token;

        try {
            // const url = `${backendUrl}srv/lineage-tracker/get_datasets_diff`;
            // const isCloud = pistisMode === 'cloud';

            // const response = await axios.get(url, {
            //     params: {
            //         uuid_1: id1,
            //         uuid_2: id2,
            //         is_cloud: isCloud,
            //     },
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //         Accept: 'application/json',
            //     },
            // });

            // diffData.value = response.data;

            // working with mockdata
            const response = mockCompare;
            diffData.value = response;

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
            const isCloud = pistisMode === 'cloud';
            const url = `${backendUrl}/srv/lineage-tracker/get_dataset_family_tree`;

            const response = await axios.get(url, {
                params: {
                    uuid: lineageID,
                    is_cloud: isCloud,
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

    const parseTableData = (apiData) => {
        const tempVersionedObject = {};

        // Process each lineage group
        for (const lineageId in apiData) {
            const lineageGroup = apiData[lineageId];

            for (const recordId in lineageGroup) {
                const record = lineageGroup[recordId];

                // Combine user_group and username into display string
                const userDisplay = record.user_group ? `${record.user_group} ${record.username}` : record.username;

                tempVersionedObject[recordId] = {
                    id: recordId,
                    version: record.version,
                    activity: record.operation || 'Unknown',
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
        addToDiff,
        resetDiff,
        toggleCompareVisibility,
        fetchData,
        fetchDatasetDiff,
        compareDatasets,
        parseTableData,
        selectTableFilter,
        loadMockData,

        // Utilities (exposed for components that need them)
        capitalizeFirstLetter,
        formatDate,
    };
});
