<script lang="ts" setup>
const fileUpload = ref<File | null>(null);
const responseContent = ref('');
const outputFormat = ref('application/json'); // Default value
const reportType = ref('full'); // Default to "full report"
const isLoading = ref(false);

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        fileUpload.value = target.files[0];
    }
};

const handleSubmit = async () => {
    isLoading.value = true;
    const formData = new FormData();

    if (fileUpload.value) {
        formData.append('file', fileUpload.value);
    }

    try {
        // Keeping the selected output format the moment of the query to use it below
        const contentType = outputFormat.value;

        const queryParams: Record<string, string> = {
            Accept: outputFormat.value,
        };

        // Add "lite_version" param if "quick report" is selected
        if (reportType.value === 'quick') {
            queryParams.lite_version = 'True';
        }

        const response = await $fetch.raw('/api/insights-generator/insights', {
            method: 'POST',
            body: formData,
            query: queryParams,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        if (contentType === 'application/json') {
            const data = response._data;
            console.log('Response data:', data);
            responseContent.value = JSON.stringify(data, null, 2);
        } else if (contentType === 'text/html') {
            const blob = new Blob([response._data as string]);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        responseContent.value = `Error: ${error.message}`;
        console.error('Error:', error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="container mx-auto p-4 bg-white border border-neutral-200 rounded-md space-y-6">
        <div class="form-container bg-neutral-100 border rounded-md border-neutral-200">
            <form @submit.prevent="handleSubmit">
                <div class="p-4 rounded-md">
                    <label for="fileUpload" class="block text-sm font-medium text-neutral-700">Upload Dataset:</label>
                    <input
                        id="fileUpload"
                        type="file"
                        class="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        @change="handleFileChange"
                    />
                </div>

                <div class="p-4 bg-neutral-100 rounded-md">
                    <label for="outputFormat" class="block text-sm font-medium text-neutral-700">Output format:</label>
                    <select
                        id="outputFormat"
                        v-model="outputFormat"
                        class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md"
                    >
                        <option value="text/html">HTML</option>
                        <option value="application/json">JSON</option>
                    </select>
                </div>

                <div class="p-4 bg-neutral-100 rounded-md">
                    <label for="reportType" class="block text-sm font-medium text-neutral-700">Report Type:</label>
                    <select
                        id="reportType"
                        v-model="reportType"
                        class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md"
                    >
                        <option value="full">Full Report</option>
                        <option value="quick">Quick Report</option>
                    </select>
                </div>

                <div class="p-4 bg-neutral-100 rounded-md text-right">
                    <button
                        type="submit"
                        class="px-4 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? 'Loading...' : 'Submit' }}
                    </button>
                </div>
            </form>
        </div>

        <div class="response-container !mt-0 p-4 border rounded-md border-neutral-200 bg-neutral-100">
            <label for="responseContent" class="block text-sm font-medium text-neutral-700">Response:</label>
            <textarea
                id="responseContent"
                v-model="responseContent"
                rows="10"
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
    gap: 20px;
}

.form-container {
    flex: 1;
}

.response-container {
    flex: 1;
}

button[disabled],
.btn-disabled,
.bg-primary-600:disabled {
    background-color: #b0b0b0 !important;
    color: #f5f5f5 !important;
    cursor: not-allowed !important;
    border-color: #b0b0b0 !important;
}
</style>
