<template>
    <div ref="treeContainer" class="custom-tree-container">
        <h4 class="tree-title">Dataset Family Tree</h4>
        <div class="tree-zoom-controls">
            <button class="zoom-btn" title="Zoom In" @click="zoomIn">+</button>
            <button class="zoom-btn" title="Zoom Out" @click="zoomOut">-</button>
        </div>

        <!-- Tooltip for restricted nodes - positioned at container level -->
        <div v-if="restrictedTooltip.show" class="restricted-tooltip" :style="restrictedTooltip.style">
            Dataset anonymized
        </div>

        <div v-if="loading" class="tree-loading">Loading tree...</div>
        <div v-else class="custom-tree-wrapper" @wheel.prevent="handleZoom" @mousedown="startPan">
            <div ref="treeElement" class="custom-tree" :style="treeTransformStyle">
                <svg ref="treeConnections" class="tree-connections" width="100%" height="100%">
                    <g class="connector-lines"></g>
                </svg>
                <template v-if="processedData && processedData.length > 0">
                    <div v-for="(level, levelIndex) in treeLevels" :key="levelIndex" class="tree-level">
                        <div
                            v-for="node in level"
                            :key="node.id"
                            class="tree-node-container"
                            :style="getNodePositionStyle(node, levelIndex)"
                            :data-node-id="node.id"
                        >
                            <div
                                :class="[
                                    'tree-node',
                                    {
                                        'node-selected': isNodeSelected(node.id),
                                        'node-hovered': hoveredNode === node.id,
                                        'node-parent': isParentNode(node.id),
                                        'node-restricted': isNodeRestricted(node.id),
                                    },
                                ]"
                                v-bind="getNodeAttributes(node)"
                                @click="handleNodeClick(node.id)"
                                @mouseenter="onNodeHover(node.id)"
                                @mouseleave="onNodeLeave"
                            >
                                <div class="node-version">{{ node.version }}</div>
                                <div class="node-date">{{ formatDate(node.timestamp) }}</div>
                            </div>
                        </div>
                    </div>
                </template>
                <div v-else class="tree-empty-state"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

// ========================================
// COMPONENT PROPS & EMITS
// ========================================

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
    addToDiff: {
        type: Function,
        default: null,
    },
    selectedDiff: {
        type: Array,
        default: () => [],
    },
    resetDiff: {
        type: Function,
        default: null,
    },
});

const emit = defineEmits(['nodeHovered']);

// ========================================
// CONSTANTS
// ========================================

const ZOOM_LIMITS = { min: 0.2, max: 2.0 };
const ZOOM_STEP = 0.1;
const VERTICAL_GAP = 50;
const _NODE_RADIUS = 25;
const _PADDING_BASE = 50;

// ========================================
// REACTIVE STATE
// ========================================
// DOM References
const treeContainer = ref(null);
const treeElement = ref(null);

// Loading State
const loading = ref(true);

// Zoom and Pan State
const zoomLevel = ref(1.0);
const lastZoomLevel = ref(1.0);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const startPanX = ref(0);
const startPanY = ref(0);
const lastMouseX = ref(0);
const lastMouseY = ref(0);

// Node State
const hoveredNode = ref(null);
const parentNodes = ref([]);
const nodePositions = ref({});
const nodePositionsMemo = ref({});

// Tooltip State
const restrictedTooltip = ref({
    show: false,
    nodeId: null,
    style: {},
});

// ========================================
// COMPUTED PROPERTIES
// ========================================

// Process the data into a format suitable for rendering
const processedData = computed(() => {
    if (!props.data) return [];

    const nodeMap = buildNodeMap(props.data);
    establishParentChildRelationships(nodeMap);
    sortChildrenByTimestamp(nodeMap);

    const rootNodes = findAndSortRootNodes(nodeMap);
    if (rootNodes.length === 0) return [];

    assignNodeLevels(nodeMap, rootNodes);

    return Object.values(nodeMap);
});

// Group nodes by their levels
const treeLevels = computed(() => {
    if (!processedData.value || processedData.value.length === 0) return [];

    const levels = [];
    const maxLevel = Math.max(...processedData.value.map((node) => node.level));

    for (let i = 0; i <= maxLevel; i++) {
        const levelNodes = processedData.value.filter((node) => node.level === i);
        levelNodes.sort(compareVersions);
        levels[i] = levelNodes;
    }

    return levels;
});

// Check if there are multiple lineages in the data
const hasMultipleLineages = computed(() => {
    if (!props.data) return false;
    return Object.keys(props.data).length > 1;
});

// ========================================
// HELPER FUNCTIONS
// ========================================

// Build node map from data
const buildNodeMap = (data) => {
    const nodeMap = {};
    Object.values(data).forEach((group) => {
        Object.keys(group).forEach((id) => {
            const node = group[id];
            nodeMap[id] = {
                id,
                ...node,
                children: [],
                level: 0,
                position: { x: 0, y: 0 },
            };
        });
    });
    return nodeMap;
};

// Establish parent-child relationships
const establishParentChildRelationships = (nodeMap) => {
    Object.values(nodeMap).forEach((node) => {
        if (node.derived_from) {
            const parent = nodeMap[node.derived_from];
            if (parent) {
                parent.children.push(node.id);
            }
        }
    });
};

// Sort children by timestamp
const sortChildrenByTimestamp = (nodeMap) => {
    Object.values(nodeMap).forEach((node) => {
        if (node.children && node.children.length > 0) {
            node.children.sort((a, b) => {
                const nodeA = nodeMap[a];
                const nodeB = nodeMap[b];
                const timeA = new Date(nodeA.timestamp || 0);
                const timeB = new Date(nodeB.timestamp || 0);
                return timeA - timeB;
            });
        }
    });
};

// Find and sort root nodes
const findAndSortRootNodes = (nodeMap) => {
    const rootNodes = Object.values(nodeMap).filter((node) => !node.derived_from);
    if (rootNodes.length > 1) {
        rootNodes.sort((a, b) => {
            const timeA = new Date(a.timestamp || 0);
            const timeB = new Date(b.timestamp || 0);
            return timeA - timeB;
        });
    }
    return rootNodes;
};

// Assign node levels using BFS
const assignNodeLevels = (nodeMap, rootNodes) => {
    // Initialize all nodes to unprocessed
    Object.values(nodeMap).forEach((node) => {
        node.level = -1;
    });

    // Process root nodes at level 0
    const queue = [...rootNodes];
    for (const node of queue) {
        node.level = 0;
    }

    // BFS to assign levels
    while (queue.length > 0) {
        const current = queue.shift();
        const nextLevel = current.level + 1;

        for (const childId of current.children) {
            const child = nodeMap[childId];
            if (child && (child.level === -1 || nextLevel < child.level)) {
                child.level = nextLevel;
                queue.push(child);
            }
        }
    }

    // Handle unprocessed nodes
    const unprocessedNodes = Object.values(nodeMap).filter((node) => node.level === -1);
    unprocessedNodes.forEach((node) => {
        if (node.derived_from && nodeMap[node.derived_from]) {
            const parent = nodeMap[node.derived_from];
            node.level = parent.level + 1;
        } else {
            node.level = 0;
        }
    });
};

// Compare versions for sorting
const compareVersions = (a, b) => {
    const versionA = a.version || '';
    const versionB = b.version || '';

    const partsA = versionA.split('.');
    const partsB = versionB.split('.');

    const letterA = partsA[0] || '';
    const letterB = partsB[0] || '';
    if (letterA !== letterB) {
        return letterA.localeCompare(letterB);
    }

    const numA = parseInt(partsA[1] || '0');
    const numB = parseInt(partsB[1] || '0');
    return numA - numB;
};

// ========================================
// POSITION CALCULATION FUNCTIONS
// ========================================

// Calculate node positions based on their level and index within that level
const calculateNodePositions = () => {
    if (!treeLevels.value || treeLevels.value.length === 0) return;

    const { nodeMap, nodeChildrenMap } = buildPositionMaps();
    sortChildrenByVersion(nodeChildrenMap, nodeMap);

    const rootNodes = getRootNodesForPositioning(nodeMap);
    const subtreeWidths = calculateSubtreeWidths(nodeChildrenMap);
    const positions = positionAllNodes(nodeMap, nodeChildrenMap, rootNodes, subtreeWidths);

    // Store calculated positions
    nodePositions.value = positions;
    nodePositionsMemo.value = { ...positions };
};

// Build maps for positioning calculations
const buildPositionMaps = () => {
    const nodeMap = {};
    const nodeChildrenMap = {};

    processedData.value.forEach((node) => {
        nodeMap[node.id] = node;
        nodeChildrenMap[node.id] = [];
    });

    processedData.value.forEach((node) => {
        if (node.derived_from) {
            const parent = nodeMap[node.derived_from];
            if (parent) {
                nodeChildrenMap[parent.id].push(node.id);
            }
        }
    });

    return { nodeMap, nodeChildrenMap };
};

// Sort children by version for consistent ordering
const sortChildrenByVersion = (nodeChildrenMap, nodeMap) => {
    Object.keys(nodeChildrenMap).forEach((parentId) => {
        nodeChildrenMap[parentId].sort((childIdA, childIdB) => {
            const nodeA = nodeMap[childIdA];
            const nodeB = nodeMap[childIdB];
            return compareVersions(nodeA, nodeB);
        });
    });
};

// Get root nodes sorted by version
const getRootNodesForPositioning = (_nodeMap) => {
    const rootNodes = processedData.value.filter((node) => !node.derived_from);
    rootNodes.sort(compareVersions);
    return rootNodes;
};

// Calculate subtree widths for layout
const calculateSubtreeWidths = (nodeChildrenMap) => {
    const subtreeWidths = {};

    const calculateWidth = (nodeId) => {
        if (subtreeWidths[nodeId]) return subtreeWidths[nodeId];

        const children = nodeChildrenMap[nodeId] || [];

        if (children.length === 0) {
            subtreeWidths[nodeId] = 1.5;
            return 1.5;
        }

        let width = 0;
        for (const childId of children) {
            width += calculateWidth(childId);
        }

        subtreeWidths[nodeId] = Math.max(width, 1.5);
        return subtreeWidths[nodeId];
    };

    // Calculate widths for all nodes
    Object.keys(nodeChildrenMap).forEach((nodeId) => calculateWidth(nodeId));

    return subtreeWidths;
};

// Position all nodes based on their subtree widths
const positionAllNodes = (_nodeMap, nodeChildrenMap, rootNodes, subtreeWidths) => {
    const positions = {};

    const positionNode = (nodeId, level, startPos, totalWidth) => {
        const children = nodeChildrenMap[nodeId] || [];

        positions[nodeId] = {
            x: startPos + totalWidth / 2,
            y: level,
            levelIndex: level,
            nodeIndex: startPos,
        };

        if (children.length > 0) {
            let currentPos = startPos;
            for (const childId of children) {
                const childWidth = subtreeWidths[childId];
                positionNode(childId, level + 1, currentPos, childWidth);
                currentPos += childWidth;
            }
        }
    };

    // Position all root nodes and their subtrees
    let currentPos = 0;
    for (const rootNode of rootNodes) {
        const width = subtreeWidths[rootNode.id];
        positionNode(rootNode.id, 0, currentPos, width);
        currentPos += width;
    }

    // Normalize positions to 0-1 range
    const totalWidth = currentPos;
    Object.keys(positions).forEach((nodeId) => {
        positions[nodeId].x = positions[nodeId].x / Math.max(totalWidth, 1);
    });

    return positions;
};

// ========================================
// ZOOM AND PAN FUNCTIONS
// ========================================

// Zoom in while maintaining center focus
const zoomIn = () => {
    const newZoom = Math.min(zoomLevel.value + ZOOM_STEP, ZOOM_LIMITS.max);
    performZoom(newZoom);
};

// Zoom out while maintaining center focus
const zoomOut = () => {
    const newZoom = Math.max(zoomLevel.value - ZOOM_STEP, ZOOM_LIMITS.min);
    performZoom(newZoom);
};

// Perform zoom operation with center focus
const performZoom = (newZoom) => {
    if (!treeElement.value || newZoom === zoomLevel.value) return;

    const oldZoom = zoomLevel.value;

    // Add transforming class for performance
    treeElement.value.classList.add('transforming');

    // Get viewport center
    const treeWrapper = treeContainer.value.querySelector('.custom-tree-wrapper');
    const wrapperRect = treeWrapper.getBoundingClientRect();
    const viewportCenterX = wrapperRect.width / 2;
    const viewportCenterY = wrapperRect.height / 2;

    // Calculate tree center point
    const treeCenterX = viewportCenterX / oldZoom - panX.value;
    const treeCenterY = viewportCenterY / oldZoom - panY.value;

    // Adjust pan to maintain center
    panX.value = -treeCenterX + viewportCenterX / newZoom;
    panY.value = -treeCenterY + viewportCenterY / newZoom;

    // Update zoom level
    zoomLevel.value = newZoom;
    lastZoomLevel.value = newZoom;

    // Apply transform
    updateSVGTransform();

    // Remove transforming class
    setTimeout(() => {
        treeElement.value?.classList.remove('transforming');
    }, 100);
};

// Auto-fit the tree to ensure it's fully visible within the container
const autoFitTree = () => {
    if (!treeElement.value || !treeContainer.value) return;

    // Get the tree wrapper dimensions
    const treeWrapper = treeContainer.value.querySelector('.custom-tree-wrapper');
    if (!treeWrapper) return;

    const wrapperRect = treeWrapper.getBoundingClientRect();
    const wrapperWidth = wrapperRect.width;
    const wrapperHeight = wrapperRect.height;

    // Find all nodes
    const nodeContainers = treeElement.value.querySelectorAll('.tree-node-container');
    if (nodeContainers.length === 0) return;

    // First create SVG connectors to ensure they're included in measurements
    createConnectorsSVG();

    // Reset to a neutral state to get accurate measurements
    zoomLevel.value = 1.0;
    lastZoomLevel.value = 1.0;
    panX.value = 0;
    panY.value = 0;

    // Apply the neutral transform
    updateSVGTransform();

    // Ensure the DOM has updated with the neutral transform
    setTimeout(() => {
        try {
            // Get updated wrapper rect after transform
            const updatedWrapperRect = treeWrapper.getBoundingClientRect();

            // Find the bounding box of all nodes with an extra safety check
            let minX = Infinity;
            let maxX = -Infinity;
            let minY = Infinity;
            let maxY = -Infinity;
            let validMeasurements = false;

            // Include all node containers in the bounding box
            nodeContainers.forEach((container) => {
                const rect = container.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return; // Skip invalid elements

                validMeasurements = true;

                // Get position relative to the wrapper
                const left = rect.left - updatedWrapperRect.left;
                const top = rect.top - updatedWrapperRect.top;
                const right = left + rect.width;
                const bottom = top + rect.height;

                minX = Math.min(minX, left);
                maxX = Math.max(maxX, right);
                minY = Math.min(minY, top);
                maxY = Math.max(maxY, bottom);
            });

            // Also include SVG connector paths in the bounding box calculation
            const connectorPaths = treeElement.value.querySelectorAll('.connector-path');
            connectorPaths.forEach((path) => {
                try {
                    const pathRect = path.getBoundingClientRect();
                    if (pathRect.width === 0 || pathRect.height === 0) return; // Skip invalid elements

                    validMeasurements = true;

                    const left = pathRect.left - updatedWrapperRect.left;
                    const top = pathRect.top - updatedWrapperRect.top;
                    const right = left + pathRect.width;
                    const bottom = top + pathRect.height;

                    minX = Math.min(minX, left);
                    maxX = Math.max(maxX, right);
                    minY = Math.min(minY, top);
                    maxY = Math.max(maxY, bottom);
                } catch (e) {
                    // Ignore errors for paths that can't be measured
                }
            });

            // Also check the circles (connection endpoints)
            const connectorCircles = treeElement.value.querySelectorAll('.line-group circle');
            connectorCircles.forEach((circle) => {
                try {
                    const circleRect = circle.getBoundingClientRect();
                    if (circleRect.width === 0 || circleRect.height === 0) return; // Skip invalid elements

                    validMeasurements = true;

                    const left = circleRect.left - updatedWrapperRect.left;
                    const top = circleRect.top - updatedWrapperRect.top;
                    const right = left + circleRect.width;
                    const bottom = top + circleRect.height;

                    minX = Math.min(minX, left);
                    maxX = Math.max(maxX, right);
                    minY = Math.min(minY, top);
                    maxY = Math.max(maxY, bottom);
                } catch (e) {
                    // Ignore errors for circles that can't be measured
                }
            });

            // Check if we actually got valid measurements
            if (!validMeasurements || !isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
                // Use fallback measurements from the direct tree element size
                minX = 0;
                minY = 0;
                maxX = treeElement.value.offsetWidth;
                maxY = treeElement.value.offsetHeight;

                // If tree element size is also invalid, use wrapper dimensions
                if (maxX === 0 || maxY === 0) {
                    maxX = wrapperWidth;
                    maxY = wrapperHeight;
                }
            }

            // Add padding based on tree size - use larger padding for better safety margin
            const basePadding = 50; // Increased from 40
            const dynamicPadding = Math.min(
                Math.max(
                    basePadding,
                    Math.floor((maxX - minX) * 0.08), // 8% of width (increased from 5%)
                    Math.floor((maxY - minY) * 0.08), // 8% of height (increased from 5%)
                ),
                120, // Cap at 120px max padding (increased from 100)
            );

            minX -= dynamicPadding;
            maxX += dynamicPadding;
            minY -= dynamicPadding;
            maxY += dynamicPadding;

            // Calculate the tree's dimensions with padding
            const treeWidth = maxX - minX;
            const treeHeight = maxY - minY;

            // Add safety check for zero dimensions
            if (treeWidth <= 0 || treeHeight <= 0) {
                // Use fallback dimensions
                const fallbackWidth = wrapperWidth * 0.8;
                const fallbackHeight = wrapperHeight * 0.8;

                // Position at center of wrapper
                panX.value = (wrapperWidth - fallbackWidth) / 2;
                panY.value = (wrapperHeight - fallbackHeight) / 2;
                zoomLevel.value = 0.8;
                lastZoomLevel.value = 0.8;

                // Apply transform and exit
                updateSVGTransform();
                setTimeout(() => createConnectorsSVG(), 200);
                return;
            }

            // Calculate the exact center point of the tree
            const treeCenterX = minX + treeWidth / 2;
            const treeCenterY = minY + treeHeight / 2;

            // Calculate the optimal zoom level to fit the tree
            const widthRatio = wrapperWidth / treeWidth;
            const heightRatio = wrapperHeight / treeHeight;

            // Take the smaller ratio to ensure the entire tree fits
            const optimalZoom = Math.min(widthRatio, heightRatio);

            // Apply a safety factor to prevent edges from being cut off
            const zoomSafetyFactor = 0.92; // Reduced from 0.95 for more safety margin

            // Allow zoom levels between 0.1 and 1.5
            const finalZoom = Math.min(Math.max(optimalZoom * zoomSafetyFactor, 0.1), 1.5);

            // Calculate the pan values to center the tree
            const wrapperCenterX = wrapperWidth / 2;
            const wrapperCenterY = wrapperHeight / 2;

            const finalPanX = (wrapperCenterX - treeCenterX) / finalZoom;
            const finalPanY = (wrapperCenterY - treeCenterY) / finalZoom;

            // Apply the calculated values
            zoomLevel.value = finalZoom;
            lastZoomLevel.value = finalZoom;
            panX.value = finalPanX;
            panY.value = finalPanY;

            // Apply the transform
            updateSVGTransform();

            // Double-check that everything fits after transformation
            setTimeout(() => {
                // Recreate SVG connectors after transform
                createConnectorsSVG();

                // Verify the fit by checking if any nodes are outside the visible area
                const visibleRect = treeWrapper.getBoundingClientRect();
                let allNodesVisible = true;

                // Check node containers
                nodeContainers.forEach((container) => {
                    const rect = container.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return; // Skip invalid elements

                    // Check if the node is fully visible with more tolerance (increased from 5 to 10)
                    const isVisible =
                        rect.left >= visibleRect.left - 10 &&
                        rect.right <= visibleRect.right + 10 &&
                        rect.top >= visibleRect.top - 10 &&
                        rect.bottom <= visibleRect.bottom + 10;

                    if (!isVisible) {
                        allNodesVisible = false;
                    }
                });

                // Also check if connector circles are visible
                if (allNodesVisible) {
                    const circles = treeElement.value.querySelectorAll('.line-group circle');
                    circles.forEach((circle) => {
                        try {
                            const rect = circle.getBoundingClientRect();
                            if (rect.width === 0 || rect.height === 0) return; // Skip invalid elements

                            // Check if the circle is fully visible
                            const isVisible =
                                rect.left >= visibleRect.left - 10 &&
                                rect.right <= visibleRect.right + 10 &&
                                rect.top >= visibleRect.top - 10 &&
                                rect.bottom <= visibleRect.bottom + 10;

                            if (!isVisible) {
                                allNodesVisible = false;
                            }
                        } catch (e) {
                            // Ignore errors
                        }
                    });
                }

                // If not all nodes are visible, apply a more aggressive secondary adjustment
                if (!allNodesVisible) {
                    // Reduce zoom by 15% to ensure everything fits (increased from 10%)
                    const adjustedZoom = finalZoom * 0.85;

                    // Recalculate pan to maintain centering
                    const adjustedPanX = finalPanX * (finalZoom / adjustedZoom);
                    const adjustedPanY = finalPanY * (finalZoom / adjustedZoom);

                    // Apply adjusted values
                    zoomLevel.value = adjustedZoom;
                    lastZoomLevel.value = adjustedZoom;
                    panX.value = adjustedPanX;
                    panY.value = adjustedPanY;

                    // Apply the adjusted transform
                    updateSVGTransform();

                    // Recreate SVG connectors with final position
                    setTimeout(() => createConnectorsSVG(), 200);
                }
            }, 300);
        } catch (error) {
            // Fallback to a very conservative zoom if there's an error
            const safeZoom = 0.4; // Decreased from 0.5 for even more safety
            zoomLevel.value = safeZoom;
            lastZoomLevel.value = safeZoom;
            panX.value = 0;
            panY.value = 0;

            if (treeElement.value) {
                updateSVGTransform();
                setTimeout(() => createConnectorsSVG(), 200);
            }
        }
    }, 300);
};

// Helper function to update SVG transform without recreating it
const updateSVGTransform = () => {
    if (!treeElement.value) return;

    // Create transform string once
    const transformStr = `scale(${zoomLevel.value}) translate(${panX.value}px, ${panY.value}px)`;

    // Apply the transform to the tree element only - SVG is inside and will inherit transform
    treeElement.value.style.transform = transformStr;

    // IMPORTANT: Fix for alignment during zoom + pan
    // Make sure the SVG transform origin is set to the same as the tree element
    const svg = treeElement.value.querySelector('.tree-connections');
    if (svg) {
        svg.style.transformOrigin = 'top left';
    }
};

// Handle mouse wheel zoom
const handleZoom = (e) => {
    if (!treeElement.value) return;

    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(ZOOM_LIMITS.min, Math.min(ZOOM_LIMITS.max, zoomLevel.value + delta));

    performZoom(newZoom);
    e.preventDefault();
};

// Start panning operation
const startPan = (e) => {
    if (e.button !== 0) return; // Only left mouse button
    if (e.target.closest('.tree-node') || e.target.closest('.tree-zoom-controls')) return;

    isPanning.value = true;
    startPanX.value = e.clientX;
    startPanY.value = e.clientY;
    lastMouseX.value = e.clientX;
    lastMouseY.value = e.clientY;

    // Add visual feedback
    treeElement.value?.classList.add('panning', 'transforming');
    treeContainer.value?.querySelector('.custom-tree-wrapper')?.classList.add('panning');

    // Add event listeners
    document.addEventListener('mousemove', onPanMove);
    document.addEventListener('mouseup', endPan);

    e.preventDefault();
};

// Handle pan movement
const onPanMove = (e) => {
    if (!isPanning.value) return;

    const dx = e.clientX - lastMouseX.value;
    const dy = e.clientY - lastMouseY.value;

    lastMouseX.value = e.clientX;
    lastMouseY.value = e.clientY;

    // Update pan position
    panX.value += dx / zoomLevel.value;
    panY.value += dy / zoomLevel.value;

    updateSVGTransform();
};

// End panning operation
const endPan = () => {
    if (!isPanning.value) return;

    isPanning.value = false;

    // Remove visual feedback
    treeElement.value?.classList.remove('panning', 'transforming');
    treeContainer.value?.querySelector('.custom-tree-wrapper')?.classList.remove('panning');

    // Remove event listeners
    document.removeEventListener('mousemove', onPanMove);
    document.removeEventListener('mouseup', endPan);

    // Redraw connectors if significant movement
    const deltaX = Math.abs(lastMouseX.value - startPanX.value);
    const deltaY = Math.abs(lastMouseY.value - startPanY.value);

    if (deltaX > 10 || deltaY > 10) {
        setTimeout(() => createConnectorsSVG(), 100);
    }
};

// ========================================
// NODE INTERACTION FUNCTIONS
// ========================================

// Select a node for comparison
const selectNode = (nodeId) => {
    if (props.addToDiff) {
        const willResetSelections = props.selectedDiff && props.selectedDiff.length === 2;

        if (willResetSelections) {
            props.resetDiff();
        }

        props.addToDiff(nodeId);
    }
};

// Check if a node has restricted visibility
const isNodeRestricted = (nodeId) => {
    for (const lineageId in props.data) {
        if (nodeId in props.data[lineageId]) {
            return props.data[lineageId][nodeId].visibility_status === 'restricted';
        }
    }
    return false;
};

// Handle node click with restriction check
const handleNodeClick = (nodeId) => {
    if (isNodeRestricted(nodeId)) {
        return;
    }
    selectNode(nodeId);
};

// Check if a node is currently selected
const isNodeSelected = (nodeId) => {
    return props.selectedDiff && props.selectedDiff.includes(nodeId);
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Calculate optimal tooltip position to keep it within viewport
const calculateTooltipPosition = (nodeId) => {
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement || !treeContainer.value) return {};

    const nodeRect = nodeElement.getBoundingClientRect();
    const containerRect = treeContainer.value.getBoundingClientRect();

    // Calculate position relative to the container
    const nodeX = nodeRect.left - containerRect.left + nodeRect.width / 2;
    const nodeY = nodeRect.top - containerRect.top;

    let style = {
        position: 'absolute',
        zIndex: 1000,
    };

    // Default positioning (tooltip above the node, centered)
    let tooltipX = nodeX;
    let tooltipY = nodeY - 45;

    // Check horizontal boundaries and adjust
    const tooltipWidth = 200; // max-width of tooltip
    if (tooltipX - tooltipWidth / 2 < 10) {
        // Too close to left edge
        tooltipX = tooltipWidth / 2 + 10;
    } else if (tooltipX + tooltipWidth / 2 > containerRect.width - 10) {
        // Too close to right edge
        tooltipX = containerRect.width - tooltipWidth / 2 - 10;
    }

    // Check vertical boundaries and adjust
    if (tooltipY < 10) {
        // Too close to top edge, show below the node
        tooltipY = nodeY + nodeRect.height + 10;
        // Add a class or style to flip the arrow
        style['--arrow-direction'] = 'up';
    } else {
        style['--arrow-direction'] = 'down';
    }

    style.left = `${tooltipX}px`;
    style.top = `${tooltipY}px`;
    style.transform = 'translateX(-50%)';

    return style;
};

const onNodeHover = (nodeId) => {
    hoveredNode.value = nodeId;

    // Show tooltip for restricted nodes
    if (isNodeRestricted(nodeId)) {
        // Use nextTick to ensure the DOM is updated before calculating position
        nextTick(() => {
            const style = calculateTooltipPosition(nodeId);
            restrictedTooltip.value = {
                show: true,
                nodeId: nodeId,
                style: style,
            };
        });
    }

    // Only highlight parent nodes if there are multiple lineages
    let parents = [];
    if (hasMultipleLineages.value) {
        parents = findParentNodes(nodeId);
    }
    parentNodes.value = parents;

    // Check if nodes are selected
    const hasSelectedNodes = props.selectedDiff && props.selectedDiff.length > 0;

    // Emit the event with parent IDs
    emit('nodeHovered', nodeId, parents, hasSelectedNodes);
};

const onNodeLeave = () => {
    hoveredNode.value = null;
    parentNodes.value = [];

    // Hide restricted tooltip
    restrictedTooltip.value = {
        show: false,
        nodeId: null,
        style: {},
    };

    emit('nodeHovered', null, []);
};

const isParentNode = (nodeId) => {
    return parentNodes.value.includes(nodeId);
};

// Find all parent nodes for a given node ID
const findParentNodes = (datasetId) => {
    const parents = [];
    let current = null;

    // Find the parent ID
    for (const lineageId in props.data) {
        if (datasetId in props.data[lineageId]) {
            current = props.data[lineageId][datasetId].derived_from;
            break;
        }
    }

    // Traverse up the tree to find all ancestors
    while (current) {
        let found = false;
        for (const lineageId in props.data) {
            if (current in props.data[lineageId]) {
                parents.push(current);
                current = props.data[lineageId][current].derived_from;
                found = true;
                break;
            }
        }
        if (!found) break;
    }

    return parents;
};

// Format timestamp for display
const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get positioning styles for a node
const getNodePositionStyle = (node, levelIndex) => {
    const positions = Object.keys(nodePositionsMemo.value).length > 0 ? nodePositionsMemo.value : nodePositions.value;

    if (!positions[node.id]) return { visibility: 'hidden' };

    const pos = positions[node.id];

    return {
        position: 'absolute',
        left: `calc(${pos.x * 100}%)`,
        top: `${levelIndex * VERTICAL_GAP}px`,
        transform: 'translate(-50%, -50%)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
        pointerEvents: 'auto',
    };
};

// ========================================
// EVENT HANDLERS
// ========================================

// Handle window resize to redraw connections
const handleWindowResize = () => {
    createConnectorsSVG();
};

// ========================================
// LIFECYCLE HOOKS
// ========================================

onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', handleWindowResize);

    nextTick(() => {
        if (processedData.value && processedData.value.length > 0) {
            if (import.meta.env.DEV) {
                console.log('Initializing tree with data:', processedData.value.length, 'nodes');
            }

            calculateNodePositions();

            setTimeout(() => {
                autoFitTree();
                loading.value = false;

                setTimeout(() => {
                    createConnectorsSVG();
                }, 300);
            }, 200);
        } else {
            loading.value = false;
        }
    });
});

onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick);
    window.removeEventListener('resize', handleWindowResize);
});

// ========================================
// WATCHERS
// ========================================

// Watch for data changes to recalculate positions
watch(
    () => props.data,
    (newData) => {
        loading.value = true;

        const hasData = newData && Object.keys(newData).length > 0;

        if (!hasData) {
            loading.value = false;
            return;
        }

        nextTick(() => {
            try {
                calculateNodePositions();

                setTimeout(() => {
                    autoFitTree();
                    loading.value = false;

                    setTimeout(() => {
                        createConnectorsSVG();
                    }, 350);
                }, 150);
            } catch (err) {
                loading.value = false;
            }
        });
    },
    { deep: true },
);

// Watch for zoom and pan changes to update connections
watch(
    () => ({ zoom: zoomLevel.value, x: panX.value, y: panY.value }),
    (newVal, oldVal) => {
        updateSVGTransform();

        const zoomChange = Math.abs(newVal.zoom - oldVal.zoom);
        const panChangeX = Math.abs(newVal.x - oldVal.x);
        const panChangeY = Math.abs(newVal.y - oldVal.y);

        // Recreate connectors on significant change
        if (zoomChange > 0.2 || panChangeX > 200 || panChangeY > 200) {
            setTimeout(() => createConnectorsSVG(), 250);
        }
    },
    { deep: true },
);

// Watch for SVG changes to ensure consistent positioning
watch(
    () => treeElement.value?.querySelector('.connector-lines')?.innerHTML,
    () => {
        if (!treeElement.value) return;

        setTimeout(() => {
            updateSVGTransform();
        }, 50);
    },
);

// Get node attributes for DOM elements
const getNodeAttributes = (node) => {
    const isRestricted = node.visibility_status === 'restricted';
    const baseTitle = `${node.version || 'Unknown'}: ${formatDate(node.timestamp)}`;
    const ariaLabel = isRestricted
        ? `Dataset version ${node.version || 'Unknown'} from ${formatDate(node.timestamp)} - Restricted Access`
        : `Dataset version ${node.version || 'Unknown'} from ${formatDate(node.timestamp)}`;

    const attributes = {
        'data-id': node.id,
        'data-version': node.version || '',
        'data-restricted': isRestricted,
        'aria-label': ariaLabel,
    };

    // Only add title for non-restricted nodes to avoid duplicate popups
    if (!isRestricted) {
        attributes.title = baseTitle;
    }

    return attributes;
};

// Get node version by ID
const _getNodeVersionById = (nodeId, data) => {
    for (const lineageId in data) {
        if (nodeId in data[lineageId]) {
            return data[lineageId][nodeId].version;
        }
    }
    return null;
};

// Handle document clicks to reset diff selection
const handleDocumentClick = (event) => {
    if (props.selectedDiff && props.selectedDiff.length > 0) {
        if (treeContainer.value && !treeContainer.value.contains(event.target)) {
            const isClickOnComparePanel = event.target.closest('.comparison-panel');
            const isClickOnTabHeader =
                event.target.closest('.tab-header') || event.target.classList.contains('tab-btn');

            if (!isClickOnComparePanel && !isClickOnTabHeader && props.resetDiff) {
                props.resetDiff();
            }
        }
    }
};

// ========================================
// SVG CONNECTOR CREATION
// ========================================

// Create SVG connectors between nodes
const createConnectorsSVG = () => {
    if (!treeElement.value) return;

    // Get SVG and group element
    const svg = treeElement.value.querySelector('.tree-connections');
    const connectorsGroup = svg?.querySelector('.connector-lines');
    if (!svg || !connectorsGroup) return;

    // Clear previous paths
    connectorsGroup.innerHTML = '';

    // IMPORTANT: Make SVG match the current tree dimensions
    // This makes sure SVG covers the entire visible area
    const _treeRect = treeElement.value.getBoundingClientRect();
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.overflow = 'visible'; // Allow SVG elements outside the bounds

    // Get essential measurements for node positioning
    const paddingTop = parseFloat(getComputedStyle(treeElement.value).paddingTop) || 0;
    // Note: verticalGap must match the value in getNodePositionStyle
    const verticalGap = 50; // This must match getNodePositionStyle
    const nodeRadius = 25; // Half of node width/height (50px/2)
    const treeWidth = treeElement.value.offsetWidth;

    // Build a node lookup table based on node data
    const nodeLookup = {};
    const nodeElements = treeElement.value.querySelectorAll('.tree-node-container');

    // Get the current scale factor to convert DOM positions back to logical coordinates
    const currentZoom = zoomLevel.value;
    const svgRect = svg.getBoundingClientRect();

    // Create a mapping of DOM positions to ensure accurate connections
    nodeElements.forEach((nodeEl) => {
        const nodeDiv = nodeEl.querySelector('.tree-node');
        if (!nodeDiv) return;

        const nodeId = nodeDiv.getAttribute('data-id');
        if (!nodeId) return;

        // Get node position from calculated model for consistency
        const pos = nodePositions.value[nodeId];
        const nodeData = processedData.value.find((n) => n.id === nodeId);

        if (nodeData && pos) {
            // Get current coordinates from DOM, but convert back to logical coordinates
            const rect = nodeEl.getBoundingClientRect();

            // Divide by zoom level to convert back to logical coordinates
            const x = (rect.left + rect.width / 2 - svgRect.left) / currentZoom;
            const y = (rect.top + rect.height / 2 - svgRect.top) / currentZoom;

            nodeLookup[nodeId] = {
                id: nodeId,
                // Use logical coordinates for SVG paths
                x: x,
                y: y,
                // Keep calculated values as backup
                calcX: pos.x * treeWidth,
                calcY: nodeData.level * verticalGap + paddingTop,
                v: nodeData.version || '',
                l: nodeData.level,
            };
        }
    });

    // Collect all parent-child relationships
    const relationships = [];
    const nodeParentMap = {}; // Map to keep track of parent-child relationships

    // Go through all data to find parent-child relationships
    Object.values(props.data).forEach((lineage) => {
        Object.entries(lineage).forEach(([childId, childData]) => {
            if (!childData.derived_from) return;

            const parentId = childData.derived_from;

            // Track parent-child relationship for ancestry path highlighting
            nodeParentMap[childId] = parentId;

            // Only include if both parent and child exist in our lookup
            if (nodeLookup[parentId] && nodeLookup[childId]) {
                // Add to our relationships array, avoiding duplicates
                const existingRelationship = relationships.find((r) => r.parent === parentId && r.child === childId);

                if (!existingRelationship) {
                    relationships.push({
                        parent: parentId,
                        child: childId,
                    });
                }
            }
        });
    });

    // Now draw all the connections
    relationships.forEach((rel) => {
        const parent = nodeLookup[rel.parent];
        const child = nodeLookup[rel.child];

        if (!parent || !child) {
            return;
        }

        // Calculate connection points using logical coordinates
        const startX = parent.x;
        const startY = parent.y + nodeRadius; // Bottom of parent node

        const endX = child.x;
        const endY = child.y - nodeRadius; // Top of child node

        // Calculate vertical and horizontal distance
        const vDist = endY - startY;
        const hDist = endX - startX;

        // Skip if vertical distance is negative (child above parent)
        if (vDist <= 0) {
            return;
        }

        // Create the line group
        const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        lineGroup.classList.add('line-group');
        lineGroup.setAttribute('data-parent', parent.id);
        lineGroup.setAttribute('data-child', child.id);

        // Store the logical coordinates for debugging/future use
        lineGroup.setAttribute('data-start-x', startX);
        lineGroup.setAttribute('data-start-y', startY);
        lineGroup.setAttribute('data-end-x', endX);
        lineGroup.setAttribute('data-end-y', endY);

        connectorsGroup.appendChild(lineGroup);

        // Create the actual connection line
        const connectorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        connectorPath.classList.add('connector-path');
        connectorPath.classList.add('connection-line');

        // Set path data with improved control points for smoother curves
        let pathData;

        // Use different path types based on the arrangement
        if (Math.abs(hDist) < 10) {
            // Nearly vertical alignment - use a simple bezier curve
            const cp1Y = startY + vDist * 0.4; // Control point for parent end
            const cp2Y = endY - vDist * 0.4; // Control point for child end

            pathData = `M ${startX} ${startY} C ${startX} ${cp1Y}, ${endX} ${cp2Y}, ${endX} ${endY}`;
        } else {
            // Horizontal offset - use an S-curve with improved control points
            const midY = startY + vDist * 0.5; // Midpoint Y
            const ctrlDist = Math.min(vDist * 0.4, 80); // Limit control point distance for smoother curves

            pathData = `M ${startX} ${startY} 
                     C ${startX} ${startY + ctrlDist}, ${startX} ${midY}, ${startX + hDist / 2} ${midY} 
                     S ${endX} ${endY - ctrlDist}, ${endX} ${endY}`;
        }

        // Set path attributes
        connectorPath.setAttribute('d', pathData);
        connectorPath.setAttribute('stroke', '#667788');
        connectorPath.setAttribute('stroke-width', '3');
        connectorPath.setAttribute('fill', 'none');
        connectorPath.setAttribute('stroke-linecap', 'round');
        connectorPath.setAttribute('stroke-linejoin', 'round');

        // Add title for hover information
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${parent.v} → ${child.v}`;
        connectorPath.appendChild(title);

        // Add to the DOM
        lineGroup.appendChild(connectorPath);

        // Add start point dot (at parent)
        const startDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        startDot.setAttribute('cx', startX);
        startDot.setAttribute('cy', startY);
        startDot.setAttribute('r', '4');
        startDot.setAttribute('fill', '#667788'); // Match the line color
        lineGroup.appendChild(startDot);

        // Add end point dot (at child)
        const endDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        endDot.setAttribute('cx', endX);
        endDot.setAttribute('cy', endY);
        endDot.setAttribute('r', '4');
        endDot.setAttribute('fill', '#667788'); // Use same color as start dot for consistency
        lineGroup.appendChild(endDot);
    });

    // Function to find all ancestral paths from a node to root
    const findAncestralPath = (nodeId) => {
        const path = [];
        let current = nodeId;

        // Traverse up the tree
        while (current && nodeParentMap[current]) {
            const parent = nodeParentMap[current];
            path.push({
                parent: parent,
                child: current,
            });
            current = parent;
        }

        return path;
    };

    // Add highlight effect - bright line when hovering node
    const nodeContainers = treeElement.value.querySelectorAll('.tree-node-container');
    nodeContainers.forEach((container) => {
        const node = container.querySelector('.tree-node');
        if (!node) return;

        const nodeId = node.getAttribute('data-id');
        if (!nodeId) return;

        node.addEventListener('mouseenter', () => {
            // Get all ancestor paths from this node to root
            const ancestralPath = findAncestralPath(nodeId);

            // Highlight all ancestral connections up to root
            ancestralPath.forEach((relation) => {
                const selector = `.line-group[data-parent="${relation.parent}"][data-child="${relation.child}"]`;
                const lines = connectorsGroup.querySelectorAll(selector);

                lines.forEach((line) => {
                    // Highlight the path
                    const path = line.querySelector('path');
                    if (path) {
                        path.setAttribute('stroke', '#ffb74d'); // Lighter orange highlight
                        path.setAttribute('stroke-width', '4');
                    }

                    // Also highlight the circles at each end of the connection
                    const circles = line.querySelectorAll('circle');
                    circles.forEach((circle) => {
                        circle.setAttribute('fill', '#ffb74d'); // Lighter orange highlight
                        circle.setAttribute('r', '5'); // Make slightly larger for emphasis
                    });

                    // Move this line group to the end of its parent to ensure it appears on top
                    // This makes highlighted lines appear above non-highlighted ones
                    connectorsGroup.appendChild(line);
                });
            });
        });

        node.addEventListener('mouseleave', () => {
            // Get all ancestor paths from this node to root
            const ancestralPath = findAncestralPath(nodeId);

            // Restore all ancestral connections
            ancestralPath.forEach((relation) => {
                const selector = `.line-group[data-parent="${relation.parent}"][data-child="${relation.child}"]`;
                const lines = connectorsGroup.querySelectorAll(selector);

                lines.forEach((line) => {
                    // Restore the path color
                    const path = line.querySelector('path');
                    if (path) {
                        path.setAttribute('stroke', '#667788'); // Restore to slate blue color
                        path.setAttribute('stroke-width', '3');
                    }

                    // Restore the circles
                    const startCircle = line.querySelector('circle:first-of-type');
                    const endCircle = line.querySelector('circle:last-of-type');

                    if (startCircle) {
                        startCircle.setAttribute('fill', '#667788'); // Match the line color
                        startCircle.setAttribute('r', '4'); // Restore original size
                    }

                    if (endCircle) {
                        endCircle.setAttribute('fill', '#667788'); // Same color as start circle
                        endCircle.setAttribute('r', '4'); // Restore original size
                    }

                    // No need to change z-order on mouseleave as it will be corrected
                    // when another connection is highlighted
                });
            });
        });
    });
};

// Computed property for tree transform style
const treeTransformStyle = computed(() => {
    return {
        transform: `scale(${zoomLevel.value}) translate(${panX.value}px, ${panY.value}px)`,
        transformOrigin: 'top left',
        willChange: isPanning.value ? 'transform' : 'auto',
    };
});
</script>

<style scoped>
/* ========================================
   CONTAINER & LAYOUT
   ======================================== */

.custom-tree-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
}

.tree-title {
    text-align: center;
    margin: 0 0 12px 0;
    color: #333;
    font-size: 1.2rem;
}

.custom-tree-wrapper {
    width: 100%;
    height: calc(100% - 40px);
    overflow: hidden;
    position: relative;
    border: 1px solid #eee;
    border-radius: 8px;
    background: #fafafa;
    flex: 1;
    cursor: grab;
}

.custom-tree-wrapper.panning {
    cursor: grabbing;
}

/* ========================================
   ZOOM CONTROLS
   ======================================== */

.tree-zoom-controls {
    position: absolute;
    top: 45px;
    right: 10px;
    z-index: 20;
    display: flex;
    gap: 5px;
}

.zoom-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: white;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
}

.zoom-btn:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

/* ========================================
   TREE CONTAINER & TRANSFORM
   ======================================== */

.custom-tree {
    position: absolute;
    transform-origin: top left;
    width: 100%;
    height: 100%;
    transition: transform 0.2s ease;
    cursor: grab;
    padding: 30px 0 5px 0;
    will-change: transform;
}

.custom-tree.panning {
    transition: none;
}

.custom-tree:active {
    cursor: grabbing;
}

/* ========================================
   TREE NODES
   ======================================== */

.tree-level {
    position: relative;
    width: 100%;
    height: 30px;
}

.tree-node-container {
    position: absolute;
    z-index: 2;
    backface-visibility: hidden;
    transform-style: preserve-3d;
    will-change: transform;
    contain: layout style;
    transform: translateZ(0);
    pointer-events: none;
}

.tree-node {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #5632d0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.2s ease,
        border-color 0.2s ease;
    border: 2px solid #495057;
    z-index: 2;
    user-select: none;
    transform-origin: center;
    will-change: transform;
    backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;
    transform: translateZ(0);
    pointer-events: auto;
}

.tree-node:hover {
    transform: scale(1.08);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

/* Node text content */
.node-version {
    font-weight: bold;
    font-size: 0.75rem;
}

.node-date {
    font-size: 0.5rem;
    opacity: 0.8;
    max-width: 45px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
}

/* Node states */
.node-selected,
.node-hovered {
    background-color: #ffe0b2;
    border-color: #ffb74d;
    color: #6d4c41;
}

.node-parent {
    background-color: #fff3e0;
    border-color: #ffcc80;
    color: #8d6e63;
}

.node-restricted {
    background-color: rgba(158, 158, 158, 0.4) !important;
    border-color: rgba(117, 117, 117, 0.6) !important;
    color: rgba(97, 97, 97, 0.9) !important;
    cursor: not-allowed !important;
    opacity: 0.8;
}

.node-restricted:hover {
    transform: none !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
}

/* ========================================
   SVG CONNECTORS
   ======================================== */

.custom-tree-wrapper svg.tree-connections {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    transform-origin: top left;
    overflow: visible;
    will-change: transform;
}

.connector-path {
    stroke-linecap: round;
    stroke-linejoin: round;
    pointer-events: stroke;
    cursor: pointer;
    transition:
        stroke 0.3s ease,
        stroke-width 0.3s ease;
}

.connection-line:hover {
    stroke: #ffb74d !important;
    stroke-width: 4px !important;
}

.line-group {
    pointer-events: all;
    transform-origin: top left;
}

.line-group circle,
.line-group path {
    filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.2));
}

/* ========================================
   LOADING & EMPTY STATES
   ======================================== */

.tree-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #999;
    font-style: italic;
}

.tree-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: calc(100% - 40px);
    color: #666;
    font-style: italic;
    background: #fafafa;
    border: 1px solid #eee;
    border-radius: 8px;
}

/* ========================================
   PERFORMANCE OPTIMIZATIONS
   ======================================== */

.custom-tree.transforming,
.custom-tree.transforming .tree-connections {
    transition: none !important;
}

/* ========================================
   TOOLTIPS
   ======================================== */

.restricted-tooltip {
    background-color: #1a1a1a;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    pointer-events: none;
    white-space: normal;
    word-wrap: break-word;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    animation: fadeInDown 0.3s ease-out;
    letter-spacing: 0.3px;
    max-width: 200px;
    min-width: 150px;
    text-align: center;
    line-height: 1.4;
}

.restricted-tooltip::after {
    content: '';
    position: absolute;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
}

/* Tooltip arrow directions */
.restricted-tooltip[style*='--arrow-direction: down']::after,
.restricted-tooltip:not([style*='--arrow-direction'])::after {
    top: 100%;
    border-color: #1a1a1a transparent transparent transparent;
}

.restricted-tooltip[style*='--arrow-direction: up']::after {
    bottom: 100%;
    top: auto;
    border-color: transparent transparent #1a1a1a transparent;
}

/* ========================================
   ANIMATIONS
   ======================================== */

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translate(-50%, -10px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}
</style>
