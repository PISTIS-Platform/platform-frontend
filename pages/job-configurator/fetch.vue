<script lang="ts" setup>
const workflowStatus = ref({});
const runId = ref('');
const getWorkflowRun = async () => {
    workflowStatus.value = {};
    const formData = new FormData();
    formData.append('runId', runId.value); // Add Run ID to the form data
    //console.log('runId:', runId.value);
    try {
        const response = await $fetch.raw('/api/job-configurator/fetch', {
            method: 'POST',
            body: formData,
        });
        //console.log('response:', response);
        if (!response.ok) {
            const data = await response.json();
            workflowStatus.value = data;
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log('Data:', data);
        workflowStatus.value = data;
    } catch (error) {
        console.error('Error:', error);
    }
};
</script>

<template>
    <div class="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
        <div class="p-4 bg-gray-100 rounded-lg shadow">
            <label for="runId" class="block text-sm font-medium text-gray-700">Run ID:</label>
            <input
                id="runId"
                v-model="runId"
                type="text"
                class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
        </div>
        <div class="p-4 bg-gray-100 rounded-lg shadow text-right">
            <button
                class="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                @click="getWorkflowRun"
            >
                Get workflow run status
            </button>
        </div>

        <!-- New card to show the response content -->
        <div v-if="Object.keys(workflowStatus).length" class="p-4 bg-gray-100 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-700">Workflow status:</h3>
            <div v-for="(value, key) in workflowStatus" :key="key" class="mt-2">
                <div class="flex items-center">
                    <span class="font-medium text-gray-700">{{ key }}:</span>
                    <span
                        v-if="typeof value !== 'object' && value !== null"
                        class="ml-2 text-gray-500"
                        :class="{
                            'text-red-500': key === 'status' && value === 'error',
                            'text-green-500': key === 'status' && value === 'finished',
                            'text-orange-500': key === 'status' && value === 'executing'
                        }"
                        >{{ value }}</span
                    >
                </div>
                <div v-if="typeof value === 'object' && value !== null" class="ml-4">
                    <div v-for="(subValue, subKey) in value" :key="subKey" class="flex items-center mt-1">
                        <span class="font-medium text-gray-700">{{ subKey }}:</span>
                        <span v-if="key === 'catalogue_dataset_endpoint' && subKey === 'id'" class="ml-2 text-gray-500">
                            <a
                                :href="`https://develop.pistis-market.eu/srv/catalog/datasets/${subValue}`"
                                class="text-blue-500 underline"
                                >{{ subValue }}</a
                            >
                        </span>
                        <span v-else class="ml-2 text-gray-500">{{ subValue }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
