<template>
    <div class="json-viewer">
        <div class="json-header">
            <button class="copy-button" :class="{ copied: showCopied }" :disabled="copying" @click="copyToClipboard">
                <span v-if="copying">Copying...</span>
                <span v-else-if="showCopied">✓ Copied!</span>
                <span v-else>📋 Copy JSON</span>
            </button>
        </div>
        <div class="json-container">
            <JsonNode :data="jsonData" :key-name="'root'" :is-root="true" />
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref } from 'vue';

import JsonNode from './JsonNode.vue';

const props = defineProps({
    data: {
        type: [Object, Array, String, Number, Boolean],
        required: true,
    },
});

const jsonData = props.data;
const copying = ref(false);
const showCopied = ref(false);

const copyToClipboard = async () => {
    try {
        copying.value = true;

        // Convert the data to a pretty-printed JSON string
        const jsonString = JSON.stringify(jsonData, null, 2);

        // Use the modern clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(jsonString);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = jsonString;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }

        // Show success feedback
        showCopied.value = true;
        setTimeout(() => {
            showCopied.value = false;
        }, 2000); // Hide after 2 seconds
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // You could add error handling UI here if needed
    } finally {
        copying.value = false;
    }
};
</script>

<style scoped>
.json-viewer {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.4;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
    max-height: 600px;
    display: flex;
    flex-direction: column;
}

.json-header {
    background: #ffffff;
    border-bottom: 1px solid #e9ecef;
    padding: 12px 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.copy-button {
    background: #5632d0;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
}

.copy-button:hover:not(:disabled) {
    background: #4527b0;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(86, 50, 208, 0.3);
}

.copy-button:active {
    transform: translateY(0);
}

.copy-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.copy-button.copied {
    background: #28a745;
}

.copy-button.copied:hover {
    background: #218838;
}

.json-container {
    color: #333;
    padding: 16px;
    overflow: auto;
    flex: 1;
}
</style>
