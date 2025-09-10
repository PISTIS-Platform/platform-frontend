<template>
    <div class="json-node">
        <!-- Object -->
        <div v-if="isObject" class="json-object">
            <span class="json-toggle" :class="{ collapsed: isCollapsed }" @click="toggleCollapsed">
                {{ isCollapsed ? '▶' : '▼' }}
            </span>
            <span v-if="!isRoot" class="json-key">{{ keyName }}:</span>
            <span class="json-bracket">{</span>
            <span v-if="isCollapsed" class="json-ellipsis">...}</span>
            <div v-else class="json-content">
                <div v-for="(value, key) in data" :key="key" class="json-property">
                    <JsonNode :data="value" :key-name="key" :depth="depth + 1" />
                </div>
                <span class="json-bracket">}</span>
            </div>
        </div>

        <!-- Array -->
        <div v-else-if="isArray" class="json-array">
            <span class="json-toggle" :class="{ collapsed: isCollapsed }" @click="toggleCollapsed">
                {{ isCollapsed ? '▶' : '▼' }}
            </span>
            <span v-if="!isRoot" class="json-key">{{ keyName }}:</span>
            <span class="json-bracket">[</span>
            <span v-if="isCollapsed" class="json-ellipsis">...]</span>
            <div v-else class="json-content">
                <div v-for="(value, index) in data" :key="index" class="json-property">
                    <JsonNode :data="value" :key-name="index" :depth="depth + 1" :is-array-item="true" />
                </div>
                <span class="json-bracket">]</span>
            </div>
        </div>

        <!-- Primitive values -->
        <div v-else class="json-primitive">
            <span v-if="!isRoot && !isArrayItem" class="json-key">{{ keyName }}:</span>
            <span v-if="isArrayItem" class="json-index">{{ keyName }}:</span>
            <span :class="getValueClass">{{ formatValue }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed, defineProps, ref } from 'vue';

const props = defineProps({
    data: {
        type: [Object, Array, String, Number, Boolean],
        required: true,
    },
    keyName: {
        type: [String, Number],
        default: '',
    },
    depth: {
        type: Number,
        default: 0,
    },
    isRoot: {
        type: Boolean,
        default: false,
    },
    isArrayItem: {
        type: Boolean,
        default: false,
    },
});

const isCollapsed = ref(props.depth > 2); // Auto-collapse deep levels

const isObject = computed(() => {
    return typeof props.data === 'object' && props.data !== null && !Array.isArray(props.data);
});

const isArray = computed(() => {
    return Array.isArray(props.data);
});

const formatValue = computed(() => {
    if (typeof props.data === 'string') {
        return `"${props.data}"`;
    }
    if (props.data === null) {
        return 'null';
    }
    if (typeof props.data === 'boolean') {
        return props.data.toString();
    }
    return props.data;
});

const getValueClass = computed(() => {
    const type = typeof props.data;
    if (props.data === null) return 'json-null';
    if (type === 'string') return 'json-string';
    if (type === 'number') return 'json-number';
    if (type === 'boolean') return 'json-boolean';
    return '';
});

const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.json-node {
    margin-left: v-bind('(depth * 20) + "px"');
}

.json-object,
.json-array {
    margin: 2px 0;
}

.json-content {
    margin-left: 20px;
}

.json-property {
    margin: 2px 0;
}

.json-toggle {
    cursor: pointer;
    color: #666;
    margin-right: 8px;
    user-select: none;
    font-size: 12px;
    transition: transform 0.2s ease;
}

.json-toggle:hover {
    color: #333;
}

.json-toggle.collapsed {
    transform: rotate(-90deg);
}

.json-key {
    color: #881391;
    font-weight: 600;
    margin-right: 8px;
}

.json-index {
    color: #666;
    margin-right: 8px;
}

.json-bracket {
    color: #666;
    font-weight: bold;
}

.json-ellipsis {
    color: #999;
    font-style: italic;
    margin-left: 4px;
}

.json-string {
    color: #c41e3a;
}

.json-number {
    color: #1c00cf;
}

.json-boolean {
    color: #0d7377;
    font-weight: bold;
}

.json-null {
    color: #808080;
    font-style: italic;
}

.json-primitive {
    margin: 2px 0;
    word-break: break-all;
}
</style>
