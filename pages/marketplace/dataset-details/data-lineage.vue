<template>
    <div class="full-height-layout" style="padding-bottom: 0">
        <button class="-ml-6 px-4 py-2 cursor-pointer" @click="router.back()">
            <Typography variant="paragraph-1" class="flex items-center gap-2 text-primary hover:text-primary-hover">
                <PhCaretLeft />
                <span>Back</span>
            </Typography>
        </button>
        <div class="title-container">
            <h2 class="dataset-title">Dataset Lineage</h2>
        </div>

        <div class="content-wrapper tab-content-container">
            <!-- Tab Headers -->
            <div class="tab-header">
                <button
                    :class="`tab-btn ${store.displayState === 'tracker' ? 'active' : ''}`"
                    @click="setDisplayState('tracker')"
                >
                    <span class="tab-icon">🔗</span> Lineage Table
                </button>
                <button
                    :class="`tab-btn ${store.displayState === 'diff' ? 'active' : ''}`"
                    @click="setDisplayState('diff')"
                >
                    <span class="tab-icon">🕒</span> Compare Versions
                </button>
                <button
                    :class="`tab-btn ${store.displayState === 'integrity' ? 'active' : ''}`"
                    @click="setDisplayState('integrity')"
                >
                    <span class="tab-icon lock-icon">🔒</span> Data Integrity
                </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content" :class="{ 'integrity-layout': store.displayState === 'integrity' }">
                <!-- Error Message - Shown across entire container -->
                <div v-if="store.familyTreeError && !store.isLoadingFamilyTree" class="error-container">
                    <div class="error-message">
                        <p class="error-title">Error loading dataset lineage</p>
                        <p class="error-text">{{ store.familyTreeError }}</p>
                    </div>
                </div>
                <template v-else>
                    <!-- Left Side: Tree Component (hidden on Integrity tab) -->
                    <div v-if="store.displayState !== 'integrity'" class="tree-column">
                        <div class="component-container">
                            <div v-if="store.isLoadingFamilyTree" class="loading-container">
                                <div class="loading-spinner"></div>
                                <p class="loading-text">Loading dataset family tree...</p>
                            </div>
                            <CustomTreeComponent
                                v-else-if="store.treeObject"
                                :add-to-diff="store.addToDiff"
                                :selected-diff="store.selectedDiff"
                                :data="store.treeObject"
                                :reset-diff="store.resetDiff"
                                @node-hovered="highlightRow"
                            />
                            <div v-else class="no-data-message">
                                <p>No family tree data available</p>
                            </div>
                        </div>
                    </div>

                    <!-- Right Side: Dynamic Content (Table, Compare, or Integrity) -->
                    <div class="table-column" :class="{ 'full-width': store.displayState === 'integrity' }">
                        <div class="component-container">
                            <div
                                v-if="store.isLoadingFamilyTree && store.displayState === 'tracker'"
                                class="loading-container"
                            >
                                <div class="loading-spinner"></div>
                                <p class="loading-text">Loading dataset history...</p>
                            </div>
                            <Table
                                v-else-if="store.displayState === 'tracker'"
                                :headers="[
                                    { key: 'version', label: 'Version' },
                                    { key: 'id', label: 'ID' },
                                    { key: 'activity', label: 'Activity' },
                                    { key: 'operation_description', label: 'Description' },
                                    { key: 'username', label: 'Username' },
                                    { key: 'timestamp', label: 'Timestamp' },
                                ]"
                                :table-data="store.tableData ? Object.values(store.tableData) : []"
                                :hovered-row="hoveredNode"
                                :hovered-parents="hoveredParents"
                                :use-red-highlight="useRedHighlight"
                                :selected-diff="store.selectedDiff"
                            />
                            <Compare v-if="store.displayState === 'diff'" :cloud-mode="!isFactory" />
                            <DataIntegrity v-if="store.displayState === 'integrity'" :lineage-id="lineageID" />
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import Compare from '@/components/catalog/dataset-details/data-lineage/components/compare/Compare.vue';
import CustomTreeComponent from '@/components/catalog/dataset-details/data-lineage/components/data-display/CustomTreeComponent.vue';
import Table from '@/components/catalog/dataset-details/data-lineage/components/data-display/Table.vue';
import DataIntegrity from '@/components/catalog/dataset-details/data-lineage/components/integrity/DataIntegrity.vue';
import { useStore } from '@/components/catalog/dataset-details/data-lineage/stores/store';
import PhCaretLeft from '~icons/ph/caret-left';

// ========================================
// COMPONENT SETUP
// ========================================

// Environment configuration
const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();
const pistisMode = route.query.pm;
const backendUrl = route.query.url;
const datasetFactoryUrl = route.query.url; // URL parameter for dataset factory
const isFactory = ref(pistisMode === 'factory');

// Route and store setup

const lineageID = route.query.id;

const { data: session } = useAuth();

const store = useStore();

store.setPistisMode(pistisMode);

if (pistisMode === 'factory') {
    store.setBackendUrl(backendUrl);
}
if (pistisMode === 'cloud') {
    store.setBackendUrl(config.public.cloudUrl.replace(/^https?:\/\//, ''));
}

// Set dataset factory URL for limited diff endpoint in cloud mode
store.setDatasetFactoryUrl(datasetFactoryUrl);

const token = session.value?.token;

// Reset display state to first tab when navigating to a new lineage page
store.displayState = 'tracker';

// Initialize data fetch
store.fetchData(lineageID, token);
// store.loadMockData();

// ========================================
// CONSTANTS
// ========================================

const RESIZE_DEBOUNCE_DELAY = 300;
const TREE_RENDER_DELAY = 500;
const TREE_SETTLE_DELAY = 1000;
const STICKY_TOP_OFFSET = 20;

// ========================================
// REACTIVE STATE
// ========================================

// Track hovered node and highlighting state
const hoveredNode = ref(null);
const hoveredParents = ref([]);
const useRedHighlight = ref(store.selectedDiff && store.selectedDiff.length > 0);

// ========================================
// LIFECYCLE HOOKS
// ========================================

onMounted(() => {
    // Set default display state
    if (!store.displayState) {
        store.displayState = 'tracker';
    }

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    // Initial layout setup
    handleResize();

    // Watch for tree data changes
    watch(
        () => store.treeObject,
        () => {
            if (store.treeObject) {
                // Staggered resize approach for proper tree rendering
                setTimeout(() => {
                    handleResize();
                    setTimeout(handleResize, TREE_SETTLE_DELAY);
                }, TREE_RENDER_DELAY);
            }
        },
        { immediate: true },
    );
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);
});

// ========================================
// WATCHERS
// ========================================

// Watch for changes in selectedDiff to update highlighting
watch(
    () => store.selectedDiff,
    (newValue, oldValue) => {
        // Check if selection state actually changed
        if (newValue.length !== oldValue.length || JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
            // Clear parent node highlighting
            hoveredParents.value = [];

            // Use red highlighting when nodes are selected
            useRedHighlight.value = newValue.length > 0;
        }
    },
    { deep: true },
);

// ========================================
// EVENT HANDLERS
// ========================================

// Handle window resize events
const handleResize = () => {
    // Dispatch custom resize event for tree component
    window.dispatchEvent(new CustomEvent('app-resize'));
};

// Handle scroll events for sticky tree positioning
const handleScroll = () => {
    const treeColumn = document.querySelector('.tree-column');
    if (!treeColumn) return;

    // Calculate sticky position based on scroll
    const scrollY = window.scrollY;
    const containerTop = Math.max(STICKY_TOP_OFFSET - scrollY, STICKY_TOP_OFFSET);
    treeColumn.style.setProperty('--sticky-top', `${containerTop}px`);
};

// ========================================
// UI STATE MANAGEMENT
// ========================================

const setHoveredParents = (parentIds) => {
    // Only set parent IDs when not using red highlighting
    hoveredParents.value = useRedHighlight.value ? [] : [...parentIds];
};

const highlightRow = (nodeId, parentIds = [], useRed = false) => {
    hoveredNode.value = nodeId;
    useRedHighlight.value = useRed;
    setHoveredParents(useRed ? [] : parentIds);
};

const setDisplayState = (state) => {
    store.displayState = state;
    // Resize tree when switching to tracker tab
    if (state === 'tracker') {
        setTimeout(handleResize, RESIZE_DEBOUNCE_DELAY);
    }
};
</script>

<style>
/* Ensure full-page height */
html,
body,
#app {
    height: 100%;
    margin: 0;
    padding: 0;
}

.full-height-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.title-container {
    padding: 24px 30px;
    width: 100%;
    display: flex;
    align-items: center;
}

.dataset-title {
    font-size: 28px;
    font-weight: 600;
    color: #333;
    margin: 0;
    letter-spacing: -0.5px;
}

/* Content Wrapper */
.content-wrapper {
    display: flex;
    flex-direction: column;
    padding: 16px;
    padding-bottom: 20px; /* Increased bottom padding */
    background: #f9f9f9; /* Light gray background */
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    margin-top: 0px;
    height: auto; /* Allow natural height based on content */
    min-height: 600px;
    flex: 0 0 auto; /* Don't stretch to fill available space */
    overflow: visible; /* Ensure sticky elements can overflow */
}

/* ========================================
   TREE COMPONENT STYLES
   ======================================== */

.tree-container {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
}

.component-container .tree-container {
    position: relative;
    height: 100%;
    width: 100%;
    padding: 20px;
}

.component-container .tree-container .chart-wrapper {
    padding-top: 20px;
    overflow: hidden;
    max-height: calc(100% - 20px);
}

.Treant > .node {
    position: absolute;
}

.Treant .collapse-switch {
    width: 3px;
    height: 3px;
}

/* Tab Header: Styled like real tabs */
.tab-header {
    margin-top: 0px;
    display: flex;
    justify-content: flex-start;
    width: 100%;
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    padding: 0 16px;
    gap: 24px;
    margin-bottom: 16px;
}

/* Tab Buttons */
.tab-btn {
    padding: 8px 16px;
    font-size: 15px;
    font-weight: 500;
    background: transparent;
    border: none;
    color: #444444;
    cursor: pointer;
    position: relative;
    transition: color 0.3s ease;
}

/* Add icons to tabs */
.tab-icon {
    margin-right: 8px;
}

/* Silver lock icon to match chain icon */
.lock-icon {
    filter: grayscale(100%) brightness(0.8) contrast(1.1);
}

/* Active Tab */
.tab-btn.active {
    color: #000000;
    font-weight: 600;
}

.tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: #000000;
}

/* Hover Effect */
.tab-btn:hover {
    color: #000000;
}

/* Tab Content Layout */
.tab-content {
    display: grid;
    grid-template-columns: minmax(250px, 1fr) 3fr;
    gap: 20px;
    padding: 0 20px;
    padding-bottom: 20px; /* Add padding at the bottom of tab content */
    width: 100%;
    height: auto; /* Allow natural height based on content */
    min-height: 600px; /* Increased from 500px for more content space */
    position: relative; /* Needed for sticky positioning */
}

/* Integrity tab layout - single column */
.tab-content.integrity-layout {
    grid-template-columns: 1fr;
    gap: 0;
}

/* Main element styling */
:deep(.main) {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    align-items: center; /* Center content horizontally */
    padding-bottom: 30px; /* Add padding at the bottom */
}

/* Adjust content wrapper to fill space */
:deep(.main) > .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* Ensure the tab content container expands properly */
.tab-content-container {
    margin: 0 auto 30px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
    max-width: 1600px;
    width: calc(100% - 60px); /* 30px margin on each side */
    display: flex;
    flex-direction: column;
    overflow: visible; /* Allow sticky elements to "break out" of container */
}

/* ========================================
   GRID LAYOUT
   ======================================== */

.tree-column {
    grid-column: 1;
    min-width: 0;
    width: 100%;
    max-width: 350px; /* Add maximum width for tree column */
    display: flex; /* Ensure flex display for proper sizing */
    position: relative; /* Needed for sticky positioning */
    --sticky-top: 20px; /* Initialize custom property */
}

.table-column {
    grid-column: 2;
    min-width: 0;
    width: 100%;
    flex-grow: 1; /* Allow table to grow and fill available space */
    min-width: 500px; /* Ensure minimum width for readability */
    overflow-y: auto; /* Allow vertical scrolling */
}

.table-column.full-width {
    grid-column: 1;
    min-width: 0;
}

/* Component containers should also respect their parent container width */
.component-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    padding-bottom: 40px; /* Increased bottom padding */
    background: #ffffff;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    min-width: 0;
    position: relative;
    overflow: visible;
}

/* Add sticky tree column container */
.tree-column .component-container {
    overflow: hidden; /* Prevent tree from overflowing */
    padding: 10px; /* Less padding to maximize tree space */
    height: 500px; /* Set a fixed height for the tree container */
    min-height: 500px; /* Ensure minimum height */
    max-height: 500px; /* Ensure maximum height */
    display: flex; /* Use flexbox to ensure proper sizing */
    flex-direction: column; /* Stack children vertically */
    position: sticky; /* Make the tree sticky */
    top: var(--sticky-top, 20px); /* Use custom property with fallback */
    z-index: 1; /* Ensure the tree stays above other content */
}

/* Add specific styles for table container */
.table-column .component-container {
    overflow: auto; /* Allow scrolling if needed */
    padding: 20px; /* More comfortable padding for table */
}

/* Ensure the tree component fills the container */
.tree-column .component-container .tree-container {
    flex: 1; /* Take all available space */
    display: flex;
    flex-direction: column;
}

/* Ensure the tree component can scale properly */
.chart-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden; /* Change from visible to hidden */
    position: relative;
    flex: 1; /* Take remaining space */
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

/* Ensure the tree chart scales appropriately */
#tree-simple,
.Treant {
    width: 100% !important;
    height: auto !important;
    max-height: 100% !important; /* Add max-height constraint */
    transform-origin: top left;
    position: relative;
}

/* Add a transition for smooth scaling */
.Treant {
    transition:
        transform 0.2s ease-in-out,
        margin-left 0.2s ease-in-out;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 768px) {
    .tab-content {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .tree-column,
    .table-column {
        grid-column: 1;
        max-width: 100%;
    }

    .tree-column .component-container {
        height: 400px;
        min-height: 400px;
        max-height: 400px;
    }

    .table-column.full-width {
        grid-column: 1;
        min-width: 0;
    }
}

/* Loading indicators */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #5632d0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 16px;
    color: #666;
    margin: 0;
    text-align: center;
}

.no-data-message {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    color: #999;
    font-style: italic;
}

.no-data-message p {
    margin: 0;
    font-size: 16px;
}

.error-container {
    grid-column: 1 / -1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: #fff5f5;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    color: #c53030;
    max-width: 800px;
    width: 100%;
}

.error-title {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 600;
    color: #c53030;
}

.error-text {
    margin: 0;
    font-size: 16px;
    color: #742a2a;
    text-align: center;
    line-height: 1.5;
}
</style>
