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

        //const data = await response.json();
        //console.log('Success:', data);
        //responseContent.value = JSON.stringify(data, null, 2);
        const data = response._data;
        responseContent.value = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error:', error);
        responseContent.value = `Error: ${error.message}`;
    }
};
</script>

<template>
    <div class="container mx-auto p-4 bg-white border border-neutral-200 rounded-md space-y-6">
        <div class="form-container rounded-md bg-neutral-100 border space-y-4 p-4">
            <div class="rounded-lg">
                <label for="fileUpload" class="block text-sm font-medium text-neutral-700">Upload Dataset:</label>
                <input
                    id="fileUpload"
                    type="file"
                    class="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    @change="handleFileChange"
                />
            </div>
            <div class="rounded-lg">
                <label for="datasetName" class="block text-sm font-medium text-neutral-700">Dataset Name:</label>
                <input
                    id="datasetName"
                    v-model="datasetName"
                    type="text"
                    class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md"
                />
            </div>
            <div class="rounded-lg">
                <label for="datasetDescription" class="block text-sm font-medium text-neutral-700"
                    >Dataset Description:</label
                >
                <input
                    id="datasetDescription"
                    v-model="datasetDescription"
                    type="text"
                    class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md"
                />
            </div>
            <div class="rounded-lg">
                <label for="jsonContent" class="block text-sm font-medium text-neutral-700">JSON Content:</label>
                <textarea
                    id="jsonContent"
                    v-model="jsonContent"
                    rows="10"
                    cols="50"
                    class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md"
                ></textarea>
            </div>
            <div class="rounded-lg text-right">
                <button
                    class="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    @click="runJobConfigurator"
                >
                    Run
                </button>
            </div>
        </div>
        <div class="response-container !mt-0 px-4 pt-4 pb-4 border rounded-md border-neutral-200 bg-neutral-100">
            <label for="responseContent" class="block text-sm font-medium text-neutral-700">Response:</label>
            <textarea
                id="responseContent"
                v-model="responseContent"
                rows="24"
                cols="50"
                class="mt-1 block w-full sm:text-sm border-neutral-200 rounded-md"
                readonly
            ></textarea>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.form-container {
    flex: 1;
}

.response-container {
    flex: 1;
}
</style>
