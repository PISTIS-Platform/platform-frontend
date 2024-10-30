<script lang="ts" setup>
const workflowStatus = ref({});
const runId = ref('');
const config = useRuntimeConfig();
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
        //const data = await response.json();
        const data = response._data;
        //console.log('Data:', data);
        //workflowStatus.value = data;
        workflowStatus.value = JSON.stringify(data);
        workflowStatus.value = JSON.parse(workflowStatus.value);
    } catch (error) {
        console.error('Error:', error);
    }
};
</script>

<template>
    <div class="container mx-auto p-4 bg-white border border-neutral-200 rounded-md space-y-1 items-start">
        <div class="flex w-full gap-4">
            <div class="pb-4 px-4 pt-3 bg-neutral-100 rounded-lg border w-full">
                <label for="runId" class="block text-sm font-medium text-neutral-700">{{
                    $t('data.runID') + ` :`
                }}</label>
                <div class="flex items-end gap-4">
                    <input
                        id="runId"
                        v-model="runId"
                        type="text"
                        class="mt-1 w-full sm:text-sm border-neutral-300 rounded-md h-10"
                    />
                    <button
                        class="px-4 h-10 py-0.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs text-nowrap"
                        @click="getWorkflowRun"
                    >
                        {{ $t('data.checkStatus') }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <SubHeading v-if="Object.keys(workflowStatus).length" :title="$t('data.workflowStatus')" class="mt-4" />
    <hr v-if="Object.keys(workflowStatus).length" class="mt-1" />
    <div
        v-if="Object.keys(workflowStatus).length"
        class="container mx-auto p-4 bg-white border border-neutral-200 rounded-md items-start mt-4"
    >
        <!-- New card to show the response content -->
        <div class="mx-auto rounded-md items-start w-full">
            <div v-for="(value, key) in workflowStatus" :key="key" class="mt-2">
                <div class="flex items-center">
                    <span class="font-medium text-neutral-700 capitalize">{{ key.replace(/_/g, ' ') }}:</span>
                    <span
                        v-if="typeof value !== 'object' && value !== null"
                        class="ml-2 text-neutral-500 capitalize"
                        :class="{
                            'text-red-500': key === 'status' && value === 'error',
                            'text-primary-500': key === 'status' && value === 'finished',
                            'text-orange-500': key === 'status' && value === 'executing',
                        }"
                        >{{ value }}</span
                    >
                    <div v-else-if="typeof value === 'object' && value !== null" class="ml-4">
                        <div v-for="(subValue, subKey) in value" :key="subKey" class="flex items-center mt-1">
                            <NuxtLink
                                :to="`${config.public.factoryUrl}/srv/catalog/datasets/${subValue}`"
                                target="_blank"
                                class="text-blue-500 underline"
                                external
                                >{{ `${config.public.factoryUrl}/srv/catalog/datasets/${subValue}` }}</NuxtLink
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-container {
    flex: 1;
}

.response-container {
    flex: 1;
}
</style>
