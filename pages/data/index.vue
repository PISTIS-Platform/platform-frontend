<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const DATA_CHECK_IN = i18n.t('data.dataCheckIn');
const DATA_TRANSFORMATION = i18n.t('data.dataTransformation');
const INSIGHTS_GENERATOR = i18n.t('data.insightGenerator');
const DATA_CHECK_IN_FILE_METHOD = i18n.t('data.dataCheckInFileMethod');
const DATA_CHECK_IN_FTP_METHOD = i18n.t('data.dataCheckInFTPMethod');
const DATA_TRANSFORMATION_RUN_METHOD = i18n.t('data.dataTransformationRunMethod');
const INSIGHTS_GENERATOR_GENERATE_METHOD = i18n.t('data.insightsGeneratorGenerateMethod');
const DATA_CHECK_IN_API_METHOD = i18n.t('data.dataCheckInApiMethod');

const dataset_format = ['csv', 'json', 'tsv', 'parquet', 'xml', 'xlsx'];
const http_methods = ['GET', 'POST'];
const periodicity = ['hourly', 'daily', 'monthly'];

const listServices = ref([
    {
        name: DATA_CHECK_IN,
        method: DATA_CHECK_IN_FILE_METHOD,
        id: 1,
        params: [
            {
                name: 'file (supported CSV, TSV, Json, XML, XLSX and Parquet)',
                type: 'source',
                vue: 'file',
                value: '"Upload Dataset" field',
            },
        ],
    },
    {
        name: DATA_CHECK_IN,
        method: DATA_CHECK_IN_FTP_METHOD,
        id: 2,
        params: [
            {
                name: 'ftp_server',
                type: 'json',
                vue: 'input',
                value: 'ftp.dlptest.com',
            },
            {
                name: 'ftp_user',
                type: 'json',
                vue: 'input',
                value: 'user',
            },
            {
                name: 'ftp_password',
                type: 'json',
                vue: 'input',
                value: 'xxxx',
            },
            {
                name: 'ftp_file_path',
                type: 'json',
                vue: 'input',
                value: 'file.ext',
            },
            {
                name: 'dataset_name',
                type: 'json',
                vue: 'input',
                value: 'Test Dataset',
            },
            {
                name: 'dataset_format',
                type: 'json',
                vue: 'select',
                vue_val: dataset_format,
                value: dataset_format[0],
            },
        ],
    },
    {
        name: DATA_TRANSFORMATION,
        method: DATA_TRANSFORMATION_RUN_METHOD,
        id: 3,
        params: [{ name: 'transformation_definition', type: 'json', vue: 'input', value: '[]' }],
    },
    { name: INSIGHTS_GENERATOR, method: INSIGHTS_GENERATOR_GENERATE_METHOD, id: 4, params: [] },
    {
        name: DATA_CHECK_IN,
        method: DATA_CHECK_IN_API_METHOD,
        id: 5,
        params: [
            {
                name: 'api_url',
                type: 'json',
                vue: 'input',
                value: 'http://test_api.com/data',
            },
            {
                name: 'method',
                type: 'json',
                vue: 'select',
                vue_val: http_methods,
                value: http_methods[0],
            },
            {
                name: 'headers',
                type: 'json',
                vue: 'aggregate',
                vue_val: ['name', 'value'],
                value: [],
            },
            {
                name: 'query_params',
                type: 'json',
                vue: 'aggregate',
                vue_val: ['name', 'value'],
                value: [],
            },
            {
                name: 'body',
                type: 'json',
                vue: 'textarea',
                value: '',
            },
        ],
    },
]);

const workflowServices = ref([]);
const datasetName = ref('');
const datasetDescription = ref('');
let fileUpload = ref<File | null>(null);
const runId = ref('None');
const wfRunTimeSpecific = ref('');
const wfPeriodicity = ref('');

const onDrag = () => {
    runId.value = 'None';

    let keys = Object.keys(listServices.value);

    for (let key in keys) {
        let method = listServices.value[key]['method'];

        if (method == DATA_CHECK_IN_FTP_METHOD || method == DATA_CHECK_IN_API_METHOD) {
            fileUpload.value = null;
        }
    }
};

const onDrop = () => {
    let unique_srvs = [];

    let keys = Object.keys(workflowServices.value);
    let fileSelected = false;

    for (let key in keys) {
        let name = workflowServices.value[key]['name'];
        let method = workflowServices.value[key]['method'];

        if (unique_srvs.includes(name)) {
            alert(' The workflow cannot contain two services of type: ' + name);
            listServices.value.push(workflowServices.value[key]);
            workflowServices.value.splice(key, 1);
        } else {
            unique_srvs.push(name);
            fileSelected =
                method == DATA_CHECK_IN_FILE_METHOD ||
                method == DATA_CHECK_IN_FTP_METHOD ||
                method == DATA_CHECK_IN_API_METHOD;
            /*if (method == DATA_CHECK_IN_FILE_METHOD) {
                fileSelected = true;
            } else if (method == DATA_CHECK_IN_FTP_METHOD) {
                fileUpload.value = 'job';
                fileSelected = true;
            }*/
        }

        if (!fileSelected) {
            fileUpload.value = null;
        }
    }
    runId.value = 'None';
};

const aggregateElement = async (services: [string], param: string) => {
    for (let service in services) {
        if (services[service].method == DATA_CHECK_IN_API_METHOD) {
            let index = services[service].params.findIndex((item) => item == param);
            services[service].params[index].value.push({ name: '', value: '' });
        }
    }
};

const removeQueryParam = async (services: [string], param: string, index_values: string) => {
    for (let service in services) {
        if (services[service].method == DATA_CHECK_IN_API_METHOD) {
            let index = services[service].params.findIndex((item) => item == param);
            services[service].params[index].value.splice(index_values, 1);
        }
    }
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        fileUpload.value = target.files[0];
    }
};

const runJobConfigurator = async (services: [string]) => {
    const formData = new FormData();
    let isoDateString = wfRunTimeSpecific.value;
    let periodicity = wfPeriodicity.value;

    if (isoDateString) {
        const date = new Date(wfRunTimeSpecific.value);
        isoDateString = date.toISOString();
        formData.append('scheduled_execution_time', isoDateString);
    }

    if (periodicity) {
        formData.append('periodicity', periodicity);
    }

    /*formData.append('workflow', jsonContent.value);*/
    formData.append('workflow', JSON.stringify(services));
    formData.append('dataset_description', datasetDescription.value);
    formData.append('dataset_name', datasetName.value);

    if (fileUpload.value) {
        formData.append('dataset', fileUpload.value, fileUpload.value.name);
    }

    try {
        if (!datasetName.value) {
            throw new Error('No dataset name provided.');
            /* } else if (!datasetDescription.value) {
            throw new Error('No dataset description provided.'); */
        } else if (services.length == 0) {
            throw new Error(
                'No service has been selected for the workflow definition, please select at least one service.',
            );
        } else if (services.length > 0) {
            if (services[0].name != DATA_CHECK_IN) {
                throw new Error(
                    'The workflow definition must include the Data Check-In service as the first job of the workflow.',
                );
            } else if (!fileUpload.value) {
                if (services[0].method != DATA_CHECK_IN_FTP_METHOD && services[0].method != DATA_CHECK_IN_API_METHOD) {
                    throw new Error('No dataset selected.');
                }
            } else if (periodicity) {
                if (services[0].method == DATA_CHECK_IN_FILE_METHOD) {
                    wfPeriodicity.value = '';
                    throw new Error('A periodicity type cannot be set for file upload data check-in');
                }
            }
        }

        const response = await $fetch('/api/job-configurator/jobconfig', {
            method: 'POST',
            body: formData,
        });

        const responseContent = await response.data;

        /*if (!response.ok) {
            throw new Error('Network response was not ok');
        }*/

        /*const responseContent = response.data;*/

        /*jsonResponse = JSON.stringify(data, null, 2);*/

        runId.value = responseContent.dag_run_id;
    } catch (error: any) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
};
</script>

<template>
    <div class="container mx-auto p-4 bg-white border border-neutral-200 rounded-md space-y-6">
        <div class="form-container rounded-md bg-neutral-100 border space-y-4 p-4">
            <!-- <div class="rounded-md" >
                <label for="fileUpload" class="block text-sm font-medium text-neutral-700"  >{{
                    $t('data.uploadDataset')
                }}</label>
                <input id="fileUpload" type="file"
                    class="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mt-3"
                    @change="handleFileChange" />
            </div> -->
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
                            @change="onDrag()"
                        >
                            <li
                                v-for="srv in listServices"
                                :key="srv.id"
                                class="p-4 mb-3 ml-2 mt-3 mr-2 flex justify-left text-sm items-center bg-pistis-200 shadow rounded-lg cursor-move"
                            >
                                <Icon name="icon-park:add-three" size="2em" />
                                <span class="ml-5">{{ srv.name }}: {{ srv.method }}</span>
                            </li>
                        </draggable>
                    </div>

                    <div class="w-full h-full max-w-lg text-left mt-3 mr-10">
                        <p class="block text-sm font-medium text-blue-900">Workflow Representation</p>
                        <div class="w-full h-full max-w-lg text-center mt-3 bg-primary-50">
                            <p class="block text-sm font-medium text-black">Start</p>
                            <Icon name="icon-park:code-download" size="3em" />
                        </div>

                        <draggable
                            tag="ul"
                            ghost-class="moving-card"
                            filter=".action-button"
                            group="all-services"
                            class="w-full min-h-20 max-w-lg mt-1 border bg-primary-50 text-sm"
                            :list="workflowServices"
                            :animation="200"
                            @change="onDrop()"
                        >
                            <li
                                v-for="(srv, index) in workflowServices"
                                :key="srv.id"
                                class="p-4 mb-3 ml-2 mt-3 mr-2 flex justify-left items-center bg-pistis-400 shadow rounded-lg font-semibold cursor-move"
                            >
                                <Icon name="icon-park:arrow-down" size="2em" />
                                <span class="ml-5">Job {{ index + 1 }} - {{ srv.name }}: {{ srv.method }}</span>
                            </li>
                        </draggable>
                        <div class="w-full h-full max-w-lg text-center mt-1 bg-primary-50">
                            <p class="block text-sm font-medium text-black">End</p>
                            <Icon name="icon-park:code" size="2.5em" />
                        </div>
                        <div class="w-full flex max-w-lg text-center mt-8">
                            <p class="block text-sm text-left font-medium text-blue-900 mt-3">
                                Specific Workflow Run Time:
                            </p>
                            <input
                                v-model="wfRunTimeSpecific"
                                type="datetime-local"
                                class="form-control text-center ml-5 mt-1"
                                title="Set Specific Event Time"
                            />
                        </div>
                        <div class="w-full flex max-w-lg text-center mt-6">
                            <p class="block text-sm text-left font-medium text-blue-900 mt-3">Periodicity:</p>
                            <USelectMenu
                                v-model="wfPeriodicity"
                                size="lg"
                                :options="periodicity"
                                placeholder=" Select periodicity ... "
                                class="w-full w-2/3 mt-1 sm:text-sm border-black rounded-md mt-2 mb-5 ml-11 text-black bg-primary-100"
                            >
                            </USelectMenu>
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
                                {{ srv.name }}: {{ srv.method }}

                                <ul class="ml-3 mr-10 m-5">
                                    <li
                                        v-for="param in srv.params"
                                        :key="param.name"
                                        class="w-full flex mt-3 ml-3 mb-5 mr-10 bg-wwhite items-center rounded-lg cursor-move text-sm font-medium text-blue-100"
                                    >
                                        <div class="rounded-md w-full flex">
                                            <label
                                                v-if="param"
                                                for="paramName"
                                                class="block w-60 mt-2 ml-1 mr-3 mb-5 font-medium text-neutral-700 flex"
                                            >
                                                {{ param.name }}:
                                            </label>
                                            <input
                                                v-if="param && param.type == 'source' && param.vue == 'file'"
                                                id="fileUpload"
                                                type="file"
                                                class="mt-1 boderblock text-sm text-neutral-500 file:mr-15 file:text-sm file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mt-1"
                                                accept=".csv,.json,.tsv,.parquet,.xlsx"
                                                @change="handleFileChange"
                                            />
                                            <input
                                                v-if="param && param.type != 'source' && param.vue == 'input'"
                                                id="paramValue"
                                                v-model="param.value"
                                                type="text"
                                                :readonly="false"
                                                class="mt-1 block w-11/12 sm:text-sm border-neutral-300 rounded-md mt-1 ml-1 mb-5 mr-8 text-black font-light"
                                            />
                                            <input
                                                v-if="param && param.type == 'source' && param.vue == 'input'"
                                                id="paramValue"
                                                v-model="param.value"
                                                type="text"
                                                :readonly="true"
                                                class="mt-1 block w-11/12 sm:text-sm border-neutral-300 rounded-md mt-2 ml-2 mb-5 mr-8 text-black font-light bg-primary-100"
                                            />
                                            <textarea
                                                v-if="param && param.vue == 'textarea'"
                                                id="paramValue"
                                                v-model="param.value"
                                                rows="10"
                                                cols="50"
                                                class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md text-black font-light ml-3 mr-7"
                                            ></textarea>
                                            <div
                                                v-if="param && param.vue == 'aggregate'"
                                                class="rounded-md w-full border-2 border-netral-300 ml-3 mr-3 bg-neutral-50"
                                            >
                                                <div
                                                    v-for="(api_param, index_value) in param.value"
                                                    :key="index_value"
                                                    class="rounded-md w-full ml-3 mr-3 mt-1 mb-1 flex"
                                                >
                                                    <div
                                                        v-for="json_field in Object.keys(api_param)"
                                                        :key="json_field"
                                                        class="rounded-md w-full ml-3 mr-3 mt-1 mb-1 flex"
                                                    >
                                                        <label
                                                            class="block mt-2 ml-1 mr-3 mb-2 font-medium text-neutral-700"
                                                        >
                                                            {{ json_field }}:
                                                        </label>
                                                        <input
                                                            id="{{ json_field }}{{ index_value }}"
                                                            v-model="param.value[index_value][json_field]"
                                                            type="text"
                                                            :readonly="false"
                                                            class="w-full flex mt-1 block w-11/12 sm:text-sm border-neutral-300 rounded-md mt-1 ml-2 mb-1 mr-0 text-black font-light"
                                                        />
                                                    </div>
                                                    <div class="ml-1 mb-2 flex mr-5 mt-2">
                                                        <Icon
                                                            v-if="param && param.vue == 'aggregate'"
                                                            name="icon-park:close-small"
                                                            size="2em"
                                                            mb-3
                                                            ml-3
                                                            @click="
                                                                removeQueryParam(workflowServices, param, index_value)
                                                            "
                                                        >
                                                        </Icon>
                                                    </div>
                                                </div>
                                            </div>
                                            <USelectMenu
                                                v-if="param && param.type != 'source' && param.vue == 'select'"
                                                v-model="param.value"
                                                size="lg"
                                                :options="param.vue_val"
                                                placeholder=" Select value ... "
                                                class="mt-1 block w-11/12 sm:text-sm border-neutral-300 rounded-md mt-2 mb-5 mr-8 text-black font-light bg-primary-100"
                                            >
                                            </USelectMenu>
                                        </div>
                                        <div class="ml-3 mb-3 flex mr-3 items-center justify-right">
                                            <Icon
                                                v-if="param && param.type != 'source' && param.vue != 'aggregate'"
                                                name="icon-park:electronic-locks-open"
                                                size="3em"
                                                mb-3
                                                ml-3
                                            />
                                            <Icon
                                                v-if="param && param.type == 'source' && param.vue != 'aggregate'"
                                                name="icon-park:electronic-locks-close"
                                                size="3em"
                                                mb-3
                                                ml-3
                                            />
                                            <button
                                                v-if="param && param.vue == 'aggregate'"
                                                class="w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                @click="aggregateElement(workflowServices, param)"
                                            >
                                                Add
                                            </button>
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
                <div class="rounded-md border border-8 mt-3 mb-1 bg-white border-pistis-500">
                    <div class="container mx-auto p-2 rounded-md ml-5 mr-10 flex w-full">
                        <Icon name="icon-park:file-code-one" size="2.5em" />
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
