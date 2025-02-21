<script lang="ts" setup>
const jsonContent = ref('');
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
    formData.append('transformation_definition', jsonContent.value);

    if (fileUpload.value) {
        formData.append('file', fileUpload.value);
    }

    try {
        const contentType = outputFormat.value;

        const response = await $fetch.raw('/api/data-transformation/transformation', {
            method: 'POST',
            body: formData,
            query: {
                Accept: outputFormat.value,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // constcontentType = response.headers.get('Content-Type');
        if (contentType === 'application/json') {
            const data = response._data;
            responseContent.value = JSON.stringify(data, null, 2);
        } else if (contentType?.includes('text/plain')) {
            const data = response._data;
            responseContent.value = data as string;
        } else if (contentType?.includes('text/xml')) {
            const data = response._data;
            responseContent.value = data as string;
        } else if (contentType?.includes('application/vnd.ms-excel')) {
            const blob = new Blob([response._data as string]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'response.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            responseContent.value = 'Excel file downloaded.';
        } else {
            responseContent.value = 'Unsupported response type';
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        responseContent.value = `Error: ${error.message}`;
        console.error('Error:', error);
    }
};
</script>

<template>
    <div class="container mx-auto p-4 bg-white border border-neutral-200 rounded-md space-y-6">
        <div class="form-container bg-neutral-100 border rounded-md border-neutral-200">
            <form @submit.prevent="handleSubmit">
                <div class="p-4">
                    <label for="jsonContent" class="block text-sm font-medium text-neutral-700"
                        >Transformation Definition:</label
                    >
                    <textarea
                        id="jsonContent"
                        v-model="jsonContent"
                        rows="10"
                        cols="50"
                        class="mt-1 block w-full sm:text-sm border-neutral-200 rounded-md"
                    ></textarea>
                </div>

                <div class="p-4 bg-neutral-100">
                    <label for="fileUpload" class="block text-sm font-medium text-neutral-700">Upload Dataset:</label>
                    <input
                        id="fileUpload"
                        type="file"
                        class="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        @change="handleFileChange"
                    />
                </div>

                <div class="p-4 bg-neutral-100">
                    <label for="outputFormat" class="block text-sm font-medium text-neutral-700">Output format:</label>
                    <select
                        id="outputFormat"
                        v-model="outputFormat"
                        class="mt-1 block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    >
                        <option value="text/plain">CSV</option>
                        <option value="application/vnd.ms-excel">Excel</option>
                        <option value="text/xml">XML</option>
                        <option value="application/json">JSON</option>
                    </select>
                </div>

                <div class="p-4 text-right">
                    <button
                        type="submit"
                        class="px-4 py-1.5 bg-primary-600 text-white rounded-md shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>

        <div class="response-container !mt-0 p-4 border rounded-md border-neutral-200 bg-neutral-100">
            <label for="responseContent" class="block text-sm font-medium text-neutral-700">Response:</label>
            <textarea
                id="responseContent"
                v-model="responseContent"
                rows="23"
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
