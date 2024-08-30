<script lang="ts" setup>
import { ref } from 'vue';

const transformations = ref([]);

const getDataTransformationCatalog = async () => {
    try {
        const response = await fetch('https://develop.pistis-market.eu/srv/data-transformation/transform/', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        transformations.value = data;
    } catch (error) {
        console.error('Error:', error);
    }
};
</script>

<template>
    <div class="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
        <div class="p-4 bg-gray-100 rounded-lg shadow text-right">
            <button
                class="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                @click="getDataTransformationCatalog"
            >
                Get Data Transformation Catalog
            </button>
        </div>

        <div class="overflow-x-auto whitespace-nowrap py-4">
            <div class="inline-flex space-x-4">
                <div
                    v-for="(transformation, index) in transformations"
                    :key="index"
                    class="p-4 bg-gray-100 rounded-lg shadow min-w-[300px]"
                >
                    <h3 class="text-lg font-bold mb-2">{{ transformation.properties.id.const }}</h3>
                    <pre>{{ transformation }}</pre>
                </div>
            </div>
        </div>
    </div>
</template>
