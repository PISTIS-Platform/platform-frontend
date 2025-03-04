<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
const listServices = ref([
    {
        name: 'Data Check-In',
        id: 1,
        params: [
            {
                name: 'file',
                type: 'source',
                value: '"Upload Dataset" field',
            },
        ],
    },
    { name: 'Data Transformation', id: 2, params: [{ name: 'transformation_definition', type: 'json', value: '[]' }] },
    { name: 'Insights Generator', id: 3, params: [] },
]);

const workflowServices = ref([]);
const datasetName = ref('');
const datasetDescription = ref('');
const fileUpload = ref<File | null>(null);
const runId = ref('None');

const onDrag = () => {
    runId.value = 'None';
};
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        fileUpload.value = target.files[0];
    }
};

const runJobConfigurator = async (services: [string]) => {
    const formData = new FormData();

    /*formData.append('workflow', jsonContent.value);*/
    formData.append('workflow', JSON.stringify(services));
    formData.append('dataset_description', datasetDescription.value);
    formData.append('dataset_name', datasetName.value);
    if (fileUpload.value) {
        formData.append('dataset', fileUpload.value);
    }

    try {
        if (!fileUpload.value) {
            throw new Error('No dataset selected.');
        } else if (!datasetName.value) {
            throw new Error('No dataset name provided.');
        } else if (!datasetDescription.value) {
            throw new Error('No dataset description provided.');
        } else if (services.length == 0) {
            throw new Error(
                'No service has been selected for the workflow definition, please select at least one service.',
            );
        } else if (services.length > 0) {
            if (services[0].id != 1)
                throw new Error(
                    'The workflow definition must include the Data Check-In service as the first job of the workflow.',
                );
        }

        const response = await $fetch.raw('/api/job-configurator/jobconfig', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseContent = response._data;
        /*jsonResponse = JSON.stringify(data, null, 2);*/

        runId.value = responseContent.data.dag_run_id;
    } catch (error: any) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
};
</script>

<template>
    <div class="container mx-auto p-4 bg-white border border-neutral-200 rounded-md space-y-6">
        <div class="form-container rounded-md bg-neutral-100 border space-y-4 p-4">
            <div class="rounded-md">
                <label for="fileUpload" class="block text-sm font-medium text-neutral-700">{{
                    $t('data.uploadDataset')
                }}</label>
                <input
                    id="fileUpload"
                    type="file"
                    class="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mt-3"
                    @change="handleFileChange"
                />
            </div>
            <div class="rounded-md">
                <label for="datasetName" class="block text-sm font-medium text-neutral-700">{{
                    $t('data.datasetName')
                }}</label>
                <input
                    id="datasetName"
                    v-model="datasetName"
                    type="text"
                    class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md mt-3 text-black bg-white"
                />
            </div>
            <div class="rounded-md">
                <label for="datasetDescription" class="block text-sm font-medium text-neutral-700">{{
                    $t('data.datasetDescription')
                }}</label>
                <input
                    id="datasetDescription"
                    v-model="datasetDescription"
                    type="text"
                    class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md mt-3 text-black bg-white"
                />
            </div>

            <div class="rounded-md">
                <label for="workflowDefinition" class="block text-sm font-medium text-neutral-700">{{
                    $t('data.workflowDefinition')
                }}</label>

                <div class="container mx-auto p-4 bg-white border rounded-md mt-3 mr-10">
                    <div class="w-full max-w-lg d text-left mt-3">
                        <p class="block text-sm font-medium text-blue-900">Services Available</p>
                        <draggable
                            tag="ul"
                            ghost-class="moving-card"
                            filter=".action-button"
                            group="all-services"
                            class="w-full min-h-20 max-w-md mt-3 border bg-primary-50 text-sm"
                            :list="listServices"
                            :animation="200"
                            @change="onDrag"
                        >
                            <li
                                v-for="srv in listServices"
                                :key="srv.id"
                                class="p-4 mb-3 ml-20 mt-3 mr-20 flex justify-between text-sm items-center bg-pistis-200 shadow rounded-lg cursor-move"
                            >
                                {{ srv.name }}
                            </li>
                        </draggable>
                    </div>

                    <div class="w-full h-full max-w-lg text-left mt-3 mr-10">
                        <p class="block text-sm font-medium text-blue-900">Workflow Representation</p>
                        <div class="w-full h-full max-w-lg text-center mt-3 bg-primary-50">
                            <p class="block text-sm font-medium text-black">Start</p>
                            <Icon name="icon-park:s-turn-left" size="2em" />
                        </div>

                        <draggable
                            tag="ul"
                            ghost-class="moving-card"
                            filter=".action-button"
                            group="all-services"
                            class="w-full min-h-20 max-w-lg mt-1 border bg-primary-50 text-sm"
                            :list="workflowServices"
                            :animation="200"
                            @change="onDrag"
                        >
                            <li
                                v-for="(srv, index) in workflowServices"
                                :key="srv.id"
                                class="p-4 mb-3 ml-20 mt-3 mr-20 flex text-center items-center bg-pistis-400 shadow rounded-lg font-semibold cursor-move"
                            >
                                <Icon name="icon-park:arrow-down" size="2em" />
                                <span class="ml-5">Job {{ index + 1 }}: {{ srv.name }}</span>
                            </li>
                        </draggable>
                        <div class="w-full h-full max-w-lg text-center mt-1 bg-primary-50">
                            <p class="block text-sm font-medium text-black">End</p>
                            <Icon name="icon-park:s-turn-right" size="2em" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="rounded-md">
                <label for="jobInputs" class="block text-sm font-medium text-neutral-700">{{
                    $t('data.jobInputs')
                }}</label>
                <div class="container mx-auto p-4 bg-white border-2 rounded-md mt-3 mb-3 mr-3 border">
                    <ul class="w-full ml-3 mr-5">
                        <li
                            v-for="srv in workflowServices"
                            :key="srv.id"
                            class="w-full mt-3 ml-3 mb-5 mr-3 bg-wwhite items-center border-2 border-pistis-200 shadow rounded-lg cursor-move text-sm font-medium text-blue-100"
                        >
                            <div class="rounded-m ml-3 mt-3 mb-2 mr-3 font-medium text-blue-900 font-semibold">
                                {{ srv.name }}:

                                <ul class="w-full ml-3 mr-5 flex">
                                    <li
                                        v-for="param in srv.params"
                                        :key="param.name"
                                        class="w-full flex mt-3 ml-3 mb-5 mr-8 bg-wwhite items-center rounded-lg cursor-move text-sm font-medium text-blue-100"
                                    >
                                        <label
                                            v-if="param"
                                            for="paramName"
                                            class="block mt-2 ml-2 mr-2 mb-5 font-medium text-neutral-700 flex"
                                        >
                                            {{ param.name }}:
                                        </label>
                                        <input
                                            v-if="param && param.type != 'source'"
                                            id="paramValue"
                                            v-model="param.value"
                                            type="text"
                                            :readonly="false"
                                            class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md mt-2 ml-2 mb-5 text-black font-light"
                                        />
                                        <input
                                            v-if="param && param.type == 'source'"
                                            id="paramValue"
                                            v-model="param.value"
                                            type="text"
                                            :readonly="true"
                                            class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md mt-2 ml-2 mb-5 text-black font-light bg-primary-100"
                                        />

                                        <div class="ml-3 mb-3 flex">
                                            <Icon
                                                v-if="param && param.type != 'source'"
                                                name="icon-park:electronic-locks-open"
                                                size="3em"
                                                mb-3
                                                ml-3
                                            />
                                            <Icon
                                                v-if="param && param.type == 'source'"
                                                name="icon-park:electronic-locks-close"
                                                size="3em"
                                                mb-3
                                                ml-3
                                            />
                                        </div>
                                    </li>
                                    <label
                                        v-if="srv.params.length == 0"
                                        for="paramName"
                                        class="block mt-3 ml-2 mr-2 mb-5 font-semibold text-neutral-700"
                                    >
                                        Service has not input params.
                                    </label>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div v-if="runId != 'None'" class="rounded-md">
                <label for="workflowExecutionResults" class="block text-sm font-medium text-neutral-700">{{
                    $t('data.workflowExecutionResults')
                }}</label>
                <div class="rounded-md border border-8 mt-3 mb-1 bg-white border-green-400">
                    <div class="container mx-auto p-2 rounded-md ml-5 mr-10 flex w-full">
                        <Icon name="icon-park:connection-point-two" size="2em" />
                        <label for="workflowRunId" class="block text-sm mt-2 font-medium text-neutral-700">
                            {{ $t('data.workflowRunId') }}</label
                        >
                        <label for="runId" class="block text-sm mt-2 font-medium font-semibold text-blue-500">
                            {{ runId }}</label
                        >
                    </div>
                </div>
            </div>
            <div class="rounded-md text-center">
                <button
                    class="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    @click="runJobConfigurator(workflowServices)"
                >
                    Run Workflow
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.moving-card {
    @apply opacity-50 bg-gray-100 border border-blue-500;
}

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
