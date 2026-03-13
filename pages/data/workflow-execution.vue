<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const workflowStatus = ref({ RunId: 'none', Status: '---', 'Catalogue Link': '---' });
const workflowList = ref([]);
const isWorkflowListLoading = ref(true);
const { t } = useI18n();
const runId = ref('');
const config = useRuntimeConfig();

const deleteWorkflowRun = async (id: string) => {
    const formData = new FormData();
    formData.append('runId', id); // Add Run ID to the form data

    try {
        const response = await $fetch.raw('/api/job-configurator/stopRun', {
            method: 'DELETE',
            body: formData,
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data['statusMessage']);
        }

        alert(`Workflow Run with ID = ` + id + ` was stopped successfully.`);
        getWorkflowRunList();

    } catch (error) {
        console.error('Error:', error);
        workflowStatus.value = { Status: 'error', 'Status Message': error };
    }
};

const getWorkflowRun = async (id: string) => {
    workflowStatus.value = {};
    const formData = new FormData();
    formData.append('runId', id); // Add Run ID to the form data

    try {
        const response = await $fetch.raw('/api/job-configurator/fetch', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const data = await response.json();
            workflowStatus.value = data;
            //throw new Error(data['statusMessage']);
        }
        //const data = await response.json();
        const data = response._data;

        //workflowStatus.value = data;
        workflowStatus.value = JSON.stringify(data);
        workflowStatus.value = JSON.parse(workflowStatus.value);
    } catch (error) {
        console.error('Error:', error);
        workflowStatus.value = { Status: 'error', 'Status Message': error };
    }
};

const getWorkflowRunList = async () => {
    isWorkflowListLoading.value = true;
    workflowList.value = [];

    try {
        const response = await $fetch.raw('/api/job-configurator/getRunsList', {
            method: 'POST',
            body: {},
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        //const data = await response.json();
        const data = response._data;
        let json_data = JSON.stringify(data);
        workflowList.value = JSON.parse(json_data)['dag_runs'];
    } catch (error) {
        console.error('Error:', error);
    } finally {
        isWorkflowListLoading.value = false;
    }
};

const assetsColumns = [

    {
        key: 'state',
        label: t('data.workflow.state'),
        class: 'text-center w-1/5',
        sortable: true,
    },
    {
        key: 'dag_run_id',
        label: t('data.workflow.runId'),
        sortable: true,
    },
    {
        key: 'conf.dataset_name',
        label: t('data.workflow.dataset_name'),
        sortable: true,
    },
    {
        key: 'conf.periodicity',
        label: t('data.workflow.periodicity'),
        sortable: true
    },
    {
        key: 'note',
        label: t('data.workflow.action'),
        class: 'text-center w-1/5',
        sortable: false
    },
    {
        key: 'start_date',
        label: t('data.workflow.start_date'),
        sortable: true,
    },
    {
        key: 'end_date',
        label: t('data.workflow.end_date'),
        sortable: true,
    }
];

interface WorkflowTableRow {
    state: string;
    dag_run_id: string;
    dataset_name: string;
    periodicty: string;
    note: string;
    start_date: Date;
    end_date: Date;
}


onMounted(() => {
    getWorkflowRunList();
    //setInterval(() => {
    //    getWorkflowRunList()
    //}, 60000)
})

//getWorkflowRunList();

const assetsPageCount = 5;

const {
    page: assetsPage,
    sortBy: assetsSortBy,
    searchString: assetsSearchString,
    filteredRows: assetsFilteredRows,
    paginatedRows: assetsPaginatedRows,
} = useTable<WorkflowTableRow>(workflowList, assetsPageCount, {
    column: 'start_date',
    direction: 'desc',
});

const gdprMessages = [
    {
        id: '0',
        text: 'No messages sent by GPDR Checker.',
    },
];

const cleanResults = () => {
    workflowStatus.value = { RunId: 'none', Status: '--', 'Catalogue Link': '--' };
};
</script>

<template>
    <PageContainer>
        <SubHeading :title="$t('data.workflowRealTimeData')" class="mt-4" />
        <hr class="mt-2" />
        <div class="w-full gap-4">
            <div class="pb-4 px-4 pt-3 bg-white rounded-lg border-4 w-full">
                <div class="w-full flex">
                    <label for="runId" class="w-20 mt-3 flex block text-sm font-medium text-neutral-700">{{
                        $t('data.runID') + ` :`
                    }}</label>
                    <input id="runId" v-model="runId" type="text"
                        class="mt-1 w-full flex sm:text-sm border-neutral-300 rounded-md h-10"
                        @change="cleanResults()" />
                </div>
                <!-- <SubHeading v-if="Object.keys(workflowStatus).length" :title="$t('data.workflowStatus')" class="mt-4 mb-2" /> -->
            </div>
            <div class="w-full rounded-md text-center mt-4 mb-2">
                <button
                    class="w-60 mr-20 px-4 h-10 py-0.5 items-center bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs text-nowrap"
                    @click="getWorkflowRun(runId)">
                    {{ $t('data.checkStatus') }}
                </button>
            </div>
        </div>
        <div class="flex justify-between items-center mt-2 w-full">
            <UCard class="mt-4 mr-6 w-full border-2 border-pistis-200">
                <template #header>
                    <SubHeading :title="$t('data.workflowStatus')" />
                </template>
                <Placeholder class="h-8">
                    <div v-if="Object.keys(workflowStatus).length"
                        class="container p-2 bg-white rounded-md items-start">
                        <!-- New card to show the response content -->
                        <div class="rounded-md items-start w-full">
                            <div v-for="(value, key) in workflowStatus" :key="key" class="mt-1">
                                <div class="w-full flex">
                                    <span class="min-w-fit font-bold text-sm text-neutral-700 capitalize">{{
                                        key.replace(/_/g, ' ')
                                    }}:</span>
                                    <span v-if="typeof value !== 'object' && value !== null"
                                        class="items-start font-bold text-sm ml-2 text-neutral-500 capitalize" :class="{
                                            'text-red-500 bg-red-100 text-red-800':
                                                key.toLowerCase() === 'status' && value.toLowerCase() === 'error',
                                            'bg-green-100 text-green-800':
                                                key.toLowerCase() === 'status' && value.toLowerCase() === 'finished',
                                            'text-orange-500 bg-orange-200':
                                                key.toLowerCase() === 'status' && value.toLowerCase() === 'executing',
                                        }">{{ value }}</span>

                                    <div v-else-if="typeof value === 'object' && value !== null" class="ml-2">
                                        <span v-if="key == 'Status Message'"
                                            class="text-red-500 bg-red-100 text-red-800 items-start font-normal text-sm capitalize">{{
                                                value }}:</span>
                                        <span v-else>
                                            <div v-for="(subValue, subKey) in value" :key="subKey" class="items-start">
                                                <NuxtLink
                                                    :to="`${config.public.factoryUrl}/catalog/dataset-details/${subValue}?pm=factory`"
                                                    target="_blank" class="text-sm text-blue-500 underline" external>{{
                                                        `${config.public.factoryUrl}/catalog/dataset-details/${subValue}?pm=factory`
                                                    }}</NuxtLink>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Placeholder>
            </UCard>

        </div>

        <div class="w-full flex items-end gap-4">
            <ChartContainer :title="$t('data.workflowExecutionList')" class="mt-6 h-[570px] relative">
                <template #right-header>
                    <UInput v-model="assetsSearchString" size="md" :placeholder="$t('search')" class="w-full ml-6" />
                </template>
                <UTable v-model:sort="assetsSortBy" :columns="assetsColumns" :rows="assetsPaginatedRows"
                    :loading="isWorkflowListLoading" :empty-state="{
                        icon: 'i-heroicons-circle-stack-20-solid',
                        label: isWorkflowListLoading ? 'Loading workflows...' : 'No items.',
                    }" sort-mode="manual">
                    <template #dag_run_id-data="{ row }">
                        <NuxtLink :to="'/data/workflow-execution'" class="text-sm text-blue-500 underline"
                            @click="getWorkflowRun(row.dag_run_id)">{{ row.dag_run_id }}</NuxtLink>
                    </template>
                    <template #state-data="{ row }">
                        <div class="text-center">
                            <span :class="[
                                'rounded-md px-4 py-1 font-medium',
                                row.state === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                            ]">{{ row.state }}
                            </span>
                        </div>
                    </template>
                    <template #conf.periodicity-data="{ row }">
                        <div class="w-full rounded-md mt-4 mb-2 ">
                            <span>{{ row.conf.periodicity ? row.conf.periodicity : '---' }}
                            </span>

                        </div>
                    </template>
                    <template #conf.dataset_name-data="{ row }">
                        <div class="w-full rounded-md mt-4 mb-2 ">
                            <span>{{ row.conf.dataset_name ? row.conf.dataset_name : '---' }}
                            </span>

                        </div>
                    </template>
                    <template #start_date-data="{ row }">
                        <div class="w-full rounded-md mt-4 mb-2 ">
                            <span>{{ new Date(row.start_date).toISOString() }}
                            </span>

                        </div>
                    </template>
                    <template #end_date-data="{ row }">
                        <div class="w-full rounded-md mt-4 mb-2 ">
                            <span>
                                {{
                                    (!row.end_date || new Date(row.end_date).toISOString() === '1970-01-01T00:00:00.000Z')
                                        ? ''
                                        : new Date(row.end_date).toISOString()
                                }}
                            </span>
                        </div>
                    </template>
                    <template #note-data="{ row }">
                        <div class="text-center">
                            <button v-if="(row.conf.periodicity && (row.state == 'queued' || row.state == 'running'))"
                                class="w-35 py-0.5 px-4 mr-2 ml-6 h-7 items-center bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs text-nowrap"
                                @click="deleteWorkflowRun(row.dag_run_id)">Stop WF</button>
                            <span
                                v-else-if="(!row.conf.periodicity || (row.conf.periodicity && (row.state == 'success' || row.state == 'failed')))">WF
                                Finished</span>
                        </div>
                    </template>
                </UTable>
                <UPagination v-if="assetsFilteredRows.length > assetsPageCount" v-model="assetsPage"
                    :page-count="assetsPageCount" :total="assetsFilteredRows.length"
                    class="absolute bottom-2 right-6" />
            </ChartContainer>
        </div>
    </PageContainer>
</template>
