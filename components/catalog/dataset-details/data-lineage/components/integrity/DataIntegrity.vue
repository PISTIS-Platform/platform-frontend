<template>
    <div class="integrity-content">
        <!-- Hash Verification Section -->
        <div class="integrity-section">
            <h3>Blockchain Integrity Verification</h3>
            <p>
                Verify that the cryptographic hash of the dataset's lineage tree matches the value stored on the
                blockchain, confirming the dataset lineage is intact and tamper-evident.
            </p>

            <div class="hash-comparison">
                <!-- Blockchain Hash -->
                <div class="hash-card">
                    <h4>Blockchain Hash</h4>
                    <div v-if="loadingBlockchainHash" class="hash-loading">
                        <div class="loading-spinner"></div>
                        <span>Retrieving blockchain hash...</span>
                    </div>
                    <div v-else-if="blockchainHash" class="hash-display">
                        <code class="hash-value">{{ blockchainHash.hash }}</code>
                        <div class="hash-metadata">
                            <span>Source: Smart Contract Executor Engine (SCEE)</span>
                            <span>Method: RFC 8785 JSON Canonicalization + SHA256 Hash</span>
                        </div>
                    </div>
                    <div v-else-if="blockchainHashError" class="hash-error">
                        <span>{{ blockchainHashError }}</span>
                        <button class="retry-button" @click="fetchBlockchainHash">Retry</button>
                    </div>
                </div>

                <!-- Computed Hash -->
                <div class="hash-card">
                    <h4>Computed Hash</h4>
                    <textarea
                        v-model="jsonInput"
                        placeholder="Paste Dataset Family Tree JSON here to canonicalize and hash..."
                        class="json-input"
                        rows="4"
                    ></textarea>
                    <button class="compute-button" :disabled="!jsonInput.trim()" @click="computeHash">
                        Canonicalize & Hash
                    </button>
                    <div v-if="computedHash" class="hash-display">
                        <code class="hash-value">{{ computedHash }}</code>
                        <div class="hash-metadata">
                            <span>Method: RFC 8785 JSON Canonicalization + SHA256 Hash</span>
                        </div>
                    </div>
                    <div v-if="hashError" class="hash-error">
                        <span>{{ hashError }}</span>
                    </div>
                </div>
            </div>

            <!-- Comparison Result -->
            <div v-if="blockchainHash && computedHash" class="comparison-result">
                <div :class="['comparison-status', hashesMatch ? 'match' : 'no-match']">
                    <span class="status-icon">{{ hashesMatch ? '✅' : '❌' }}</span>
                    <span class="status-text">
                        {{
                            hashesMatch
                                ? 'Hashes Match - Integrity Verified'
                                : 'Hashes Do Not Match - Integrity Check Failed'
                        }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Family Tree JSON Section -->
        <div class="integrity-section">
            <div class="integrity-header">
                <div class="header-content">
                    <h3>Dataset Family Tree JSON</h3>
                    <p>Raw JSON data from /get_dataset_family_tree endpoint</p>
                </div>
                <div class="header-buttons">
                    <button v-if="familyTreeData" class="use-button" @click="useCurrentFamilyTree">
                        Use This JSON for Verification
                    </button>
                </div>
            </div>
            <JsonViewer v-if="familyTreeData" :data="familyTreeData" />
            <div v-else class="no-data-message">
                <p>No family tree data available</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

import { useStore } from '@/components/catalog/dataset-details/data-lineage/stores/store';

import JsonViewer from '../data-display/json/JsonViewer.vue';

// ========================================
// PROPS
// ========================================

const _props = defineProps({
    lineageId: {
        type: String,
        required: true,
    },
});

// ========================================
// STORE SETUP
// ========================================

const store = useStore();

// ========================================
// REACTIVE STATE
// ========================================

// Integrity verification state
const jsonInput = ref('');
const computedHash = ref('');
const hashError = ref('');
const blockchainHash = ref(null);
const loadingBlockchainHash = ref(false);
const blockchainHashError = ref('');

// ========================================
// COMPUTED PROPERTIES
// ========================================

const familyTreeData = computed(() => store.familyTreeData);

const hashesMatch = computed(() => {
    return blockchainHash.value && computedHash.value && blockchainHash.value.hash === computedHash.value;
});

// ========================================
// INTEGRITY VERIFICATION METHODS
// ========================================

const route = useRoute();
const pistisMode = route.query.pm;

const nuxtConfig = useRuntimeConfig();
let backendUrl = '';
if (pistisMode === 'factory') {
    backendUrl = nuxtConfig.public.factoryUrl;
} else {
    backendUrl = nuxtConfig.public.cloudUrl;
}

const { data: session } = useAuth();

const token = session.value?.token;

const fetchBlockchainHash = async () => {
    try {
        loadingBlockchainHash.value = true;
        blockchainHashError.value = '';

        const url = `${backendUrl}srv/lineage-tracker/blockchain-hash`;

        const response = await axios.get(url, {
            params: {
                dataset_id: props.lineageId,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        blockchainHash.value = response.data;
    } catch (error) {
        blockchainHashError.value = error.message || 'Failed to retrieve blockchain hash';
    } finally {
        loadingBlockchainHash.value = false;
    }
};

// RFC 8785 JSON Canonicalization implementation
const canonicalizeJson = (obj) => {
    // Handle different types according to RFC 8785
    if (obj === null || obj === undefined) {
        return 'null';
    }

    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }

    if (typeof obj === 'number') {
        // Handle numbers according to RFC 8785
        if (!isFinite(obj)) {
            throw new Error('Invalid number: must be finite');
        }
        // For integers, avoid scientific notation
        if (Number.isInteger(obj) && Math.abs(obj) < 1e15) {
            return obj.toString();
        }
        // For floats, use standard JSON representation
        return JSON.stringify(obj).replace(/"/g, '');
    }

    if (typeof obj === 'string') {
        // Escape string according to JSON rules (RFC 8785 uses minimal escaping)
        return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
        // Canonicalize array elements
        const elements = obj.map((item) => canonicalizeJson(item));
        return '[' + elements.join(',') + ']';
    }

    if (typeof obj === 'object') {
        // Sort object keys lexicographically and canonicalize recursively
        const sortedKeys = Object.keys(obj).sort();
        const pairs = sortedKeys.map((key) => {
            const canonicalKey = JSON.stringify(key);
            const canonicalValue = canonicalizeJson(obj[key]);
            return canonicalKey + ':' + canonicalValue;
        });
        return '{' + pairs.join(',') + '}';
    }

    throw new Error('Unsupported data type: ' + typeof obj);
};

const computeHash = async () => {
    try {
        hashError.value = '';
        computedHash.value = '';

        if (!jsonInput.value.trim()) {
            hashError.value = 'Please enter JSON data';
            return;
        }

        // Parse JSON to validate it
        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonInput.value);
        } catch (error) {
            hashError.value = 'Invalid JSON format';
            return;
        }

        // Apply RFC 8785 canonicalization
        const canonicalJson = canonicalizeJson(parsedJson);

        // Compute SHA256 hash
        const encoder = new TextEncoder();
        const data = encoder.encode(canonicalJson);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

        computedHash.value = hashHex;
    } catch (error) {
        hashError.value = 'Failed to compute hash: ' + error.message;
    }
};

const useCurrentFamilyTree = () => {
    if (store.familyTreeData) {
        jsonInput.value = JSON.stringify(store.familyTreeData, null, 2);
    }
};

// ========================================
// LIFECYCLE HOOKS
// ========================================

onMounted(() => {
    // Fetch blockchain hash when component mounts
    fetchBlockchainHash();
});
</script>

<style scoped>
/* Integrity tab styles */
.integrity-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    gap: 24px;
    overflow-y: auto;
}

.integrity-section {
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
}

.integrity-section h3 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
}

.integrity-section p {
    font-size: 14px;
    color: #666;
    margin: 0 0 20px 0;
}

.integrity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.header-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
}

.header-content h3 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
}

.header-content p {
    font-size: 14px;
    color: #666;
    margin: 0;
    font-style: italic;
}

.use-button {
    background: #5632d0;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.use-button:hover {
    background: #4527b0;
    transform: translateY(-1px);
}

/* Hash Verification Styles */
.hash-comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.hash-card {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    background: #f8f9fa;
}

.hash-card h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.hash-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #5632d0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.hash-display {
    margin-top: 12px;
}

.hash-value {
    display: block;
    background: #ffffff;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 8px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    word-break: break-all;
    color: #333;
    margin-bottom: 8px;
}

.hash-metadata {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #666;
}

.hash-error {
    color: #dc3545;
    font-size: 14px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.retry-button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.retry-button:hover {
    background: #c82333;
}

.json-input {
    width: 100%;
    min-height: 80px;
    padding: 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    resize: vertical;
    margin-bottom: 12px;
    box-sizing: border-box;
}

.json-input:focus {
    outline: none;
    border-color: #5632d0;
    box-shadow: 0 0 0 2px rgba(86, 50, 208, 0.2);
}

.compute-button {
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    width: 100%;
}

.compute-button:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
}

.compute-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* Comparison Result Styles */
.comparison-result {
    margin-top: 20px;
    padding: 16px;
    border-radius: 8px;
    text-align: center;
}

.comparison-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 600;
}

.comparison-status.match {
    color: #28a745;
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 8px;
    padding: 16px;
}

.comparison-status.no-match {
    color: #dc3545;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 8px;
    padding: 16px;
}

.status-icon {
    font-size: 20px;
}

.status-text {
    font-size: 16px;
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

@media (max-width: 768px) {
    .hash-comparison {
        grid-template-columns: 1fr;
    }

    .integrity-header {
        flex-direction: column;
        gap: 12px;
        align-items: center;
    }

    .header-content {
        text-align: center;
    }
}
</style>
