<script lang="ts" setup>
const datasetName = ref('');
const datasetDescription = ref('');
const jsonContent = ref('');
const fileUpload = ref<File | null>(null);
const responseContent = ref('');

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        fileUpload.value = target.files[0];
    }
};

const runJobConfigurator = async () => {
    const formData = new FormData();
    formData.append('workflow', jsonContent.value);
    formData.append('dataset_description', datasetDescription.value);
    formData.append('dataset_name', datasetName.value);
    if (fileUpload.value) {
        formData.append('dataset', fileUpload.value);
    }

    try {
        const response = await $fetch.raw('/api/job-configurator/jobconfig', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        //console.log('Success:', data);
        responseContent.value = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error:', error);
        responseContent.value = `Error: ${error.message}`;
    }
};
</script>

<template>
    <div class="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
        <div class="p-4 bg-gray-100 rounded-lg shadow">
            <label for="fileUpload" class="block text-sm font-medium text-gray-700">Upload Dataset:</label>
            <input
                id="fileUpload"
                type="file"
                class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                @change="handleFileChange"
            />
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

        <div v-if="responseContent" class="p-4 bg-gray-100 rounded-lg shadow">
            <label for="responseContent" class="block text-sm font-medium text-gray-700">Workflow run response:</label>
            <textarea
                id="responseContent"
                v-model="responseContent"
                rows="10"
                cols="50"
                class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                readonly
            ></textarea>
        </div>
    </div>
</template>
