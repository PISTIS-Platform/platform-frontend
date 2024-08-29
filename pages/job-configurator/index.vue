<script lang="ts" setup>
import { ref } from 'vue';

const selectedOption = ref('datasetId');
const datasetId = ref('');
const datasetName = ref('');
const datasetDescription = ref('');
const jsonContent = ref('');
const fileUpload = ref(null);

const runJobConfigurator = async () => {
    const formData = new FormData();
    formData.append('workflow', jsonContent.value);
    formData.append('dataset_description', datasetDescription.value);
    formData.append('dataset_name', datasetName.value);
    if (fileUpload.value) {
        formData.append('dataset', fileUpload.value);
    }

    try {
        const response = await fetch('https://develop.pistis-market.eu/srv/job-configurator', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Success:', data);
    } catch (error) {
        console.error('Error:', error);
    }
};
</script>

<template>
    <div class="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 bg-gray-100 rounded-lg shadow">
                <label for="option" class="block text-sm font-medium text-gray-700">Choose an option:</label>
                <select
                    id="option"
                    v-model="selectedOption"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="datasetId">Dataset ID</option>
                    <option value="uploadDataset">Upload Dataset</option>
                </select>
            </div>

            <div v-if="selectedOption === 'datasetId'" class="p-4 bg-gray-100 rounded-lg shadow">
                <label for="datasetId" class="block text-sm font-medium text-gray-700">Dataset ID:</label>
                <input
                    id="datasetId"
                    v-model="datasetId"
                    type="text"
                    class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
            </div>

            <div v-if="selectedOption === 'uploadDataset'" class="p-4 bg-gray-100 rounded-lg shadow">
                <label for="fileUpload" class="block text-sm font-medium text-gray-700">Upload Dataset:</label>
                <input
                    id="fileUpload"
                    type="file"
                    class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    @change="(event) => (fileUpload.value = event.target.files[0])"
                />
            </div>
        </div>

        <div class="p-4 bg-gray-100 rounded-lg shadow">
            <label for="datasetName" class="block text-sm font-medium text-gray-700">Dataset Name:</label>
            <input
                id="datasetName"
                v-model="datasetName"
                type="text"
                class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
        </div>

        <div class="p-4 bg-gray-100 rounded-lg shadow">
            <label for="datasetDescription" class="block text-sm font-medium text-gray-700">Dataset Description:</label>
            <input
                id="datasetDescription"
                v-model="datasetDescription"
                type="text"
                class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
        </div>

        <div class="p-4 bg-gray-100 rounded-lg shadow">
            <label for="jsonContent" class="block text-sm font-medium text-gray-700">JSON Content:</label>
            <textarea
                id="jsonContent"
                v-model="jsonContent"
                rows="10"
                cols="50"
                class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            ></textarea>
        </div>

        <div class="p-4 bg-gray-100 rounded-lg shadow text-right">
            <button
                class="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                @click="runJobConfigurator"
            >
                Run
            </button>
        </div>
    </div>
</template>
