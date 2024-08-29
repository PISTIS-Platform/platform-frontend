<script lang="ts" setup>
import { ref } from 'vue';

const jsonContent = ref('');
const fileUpload = ref(null);

const runDataTransformation = async () => {
    const formData = new FormData();
    formData.append('transformation_definition', jsonContent.value);
    if (fileUpload.value) {
        formData.append('file', fileUpload.value);
    }

    try {
        const response = await fetch('https://develop.pistis-market.eu/srv/data-transformation/transform', {
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
        <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div class="p-4 bg-gray-100 rounded-lg shadow">
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
            <label for="jsonContent" class="block text-sm font-medium text-gray-700">Transformation Definition:</label>
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
                @click="runDataTransformation"
            >
                Run
            </button>
        </div>
    </div>
</template>
