<script lang="ts" setup>
import { ref } from 'vue';

const fileUpload = ref<File | null>(null);
const responseContent = ref('');
const outputFormat = ref('application/json'); // Default value

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        fileUpload.value = target.files[0];
    }
};

const handleSubmit = async () => {
    const formData = new FormData();

    if (fileUpload.value) {
        formData.append('file', fileUpload.value);
    }

    try {
        const response = await $fetch('/api/insights-generator/insights', {
            method: 'POST',
            body: formData,
            query: {
                Accept: outputFormat.value,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const contentType = response.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
            //const data = await response.json();
            //responseContent.value = JSON.stringify(data, null, 2); // Format JSON response
            const data = await response.text();
            responseContent.value = data;
            //responseContent.value = data;
        } else if (contentType?.includes('text/html')) {
            //const data = await response.text();
            //responseContent.value = data;
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'response.html';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            responseContent.value = 'HTML file downloaded.';
        } else {
            responseContent.value = 'Unsupported response type';
        }
    } catch (error) {
        responseContent.value = `Error: ${error.message}`;
        console.error('Error:', error);
    }
};
</script>

<template>
    <div class="container mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
        <div class="form-container">
            <form @submit.prevent="handleSubmit">
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
                    <label for="outputFormat" class="block text-sm font-medium text-gray-700">Output format:</label>
                    <select
                        id="outputFormat"
                        v-model="outputFormat"
                        class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    >
                        <option value="text/html">HTML</option>
                        <option value="application/json">JSON</option>
                    </select>
                </div>

                <div class="p-4 bg-gray-100 rounded-lg shadow text-right">
                    <button
                        type="submit"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>

        <div class="response-container">
            <div class="p-4 bg-gray-100 rounded-lg shadow">
                <label for="responseContent" class="block text-sm font-medium text-gray-700">Response:</label>
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
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
    gap: 20px;
}

.form-container {
    flex: 1;
}

.response-container {
    flex: 1;
}
</style>
