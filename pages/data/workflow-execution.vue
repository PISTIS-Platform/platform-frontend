<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const workflowStatus = ref({ RunId: 'none', Status: '---', 'Catalogue Link': '---' });
const workflowList = ref([]);
const { t } = useI18n();
const runId = ref('');
const config = useRuntimeConfig();

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
    }
};

const assetsColumns = [
    {
        key: 'dag_run_id',
        label: t('data.workflow.runId'),
        sortable: true,
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
    },
    {
        key: 'run_type',
        label: t('data.workflow.run_type'),
        sortable: true,
    },
    {
        key: 'state',
        label: t('data.workflow.state'),
        class: 'text-center w-1/5',
        sortable: true,
    },
];

interface WorkflowTableRow {
    dag_run_id: string;
    start_date: string;
    end_date: string;
    run_type: string;
    state: string;
}

getWorkflowRunList();

const assetsPageCount = 5;

const {
    page: assetsPage,
    sortBy: assetsSortBy,
    searchString: assetsSearchString,
    filteredRows: assetsFilteredRows,
    paginatedRows: assetsPaginatedRows,
} = useTable<WorkflowTableRow>(workflowList, assetsPageCount, {
    column: 'dag_run_id',
    direction: 'asc',
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
                    <input
                        id="runId"
                        v-model="runId"
                        type="text"
                        class="mt-1 w-full flex sm:text-sm border-neutral-300 rounded-md h-10"
                        @change="cleanResults()"
                    />
                </div>
                <!-- <SubHeading v-if="Object.keys(workflowStatus).length" :title="$t('data.workflowStatus')" class="mt-4 mb-2" /> -->
            </div>
            <div class="w-full rounded-md text-center mt-4 mb-2">
                <button
                    class="w-60 mr-20 px-4 h-10 py-0.5 items-center bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs text-nowrap"
                    @click="getWorkflowRun(runId)"
                >
                    {{ $t('data.checkStatus') }}
                </button>
            </div>
        </div>
        <div class="flex justify-between items-center mt-2 w-full">
            <UCard class="mt-4 mr-6 w-1/2 border-2 border-pistis-200">
                <template #header>
                    <SubHeading :title="$t('data.workflowStatus')" />
                </template>
                <Placeholder class="h-8">
                    <div
                        v-if="Object.keys(workflowStatus).length"
                        class="container p-2 bg-white rounded-md items-start"
                    >
                        <!-- New card to show the response content -->
                        <div class="rounded-md items-start w-full">
                            <div v-for="(value, key) in workflowStatus" :key="key" class="mt-1">
                                <div class="w-full flex">
                                    <span class="min-w-fit font-bold text-sm text-neutral-700 capitalize"
                                        >{{ key.replace(/_/g, ' ') }}:</span
                                    >
                                    <span
                                        v-if="typeof value !== 'object' && value !== null"
                                        class="items-start font-bold text-sm ml-2 text-neutral-500 capitalize"
                                        :class="{
                                            'text-red-500 bg-red-100 text-red-800':
                                                key.toLowerCase() === 'status' && value.toLowerCase() === 'error',
                                            'bg-green-100 text-green-800':
                                                key.toLowerCase() === 'status' && value.toLowerCase() === 'finished',
                                            'text-orange-500 bg-orange-200':
                                                key.toLowerCase() === 'status' && value.toLowerCase() === 'executing',
                                        }"
                                        >{{ value }}</span
                                    >

                                    <div v-else-if="typeof value === 'object' && value !== null" class="ml-2">
                                        <span
                                            v-if="key == 'Status Message'"
                                            class="text-red-500 bg-red-100 text-red-800 items-start font-normal text-sm capitalize"
                                            >{{ value }}:</span
                                        >
                                        <span v-else>
                                            <div v-for="(subValue, subKey) in value" :key="subKey" class="items-start">
                                                <NuxtLink
                                                    :to="`${config.public.factoryUrl}/srv/catalog/datasets/${subValue}`"
                                                    target="_blank"
                                                    class="text-sm text-blue-500 underline"
                                                    external
                                                    >{{
                                                        `${config.public.factoryUrl}/srv/catalog/datasets/${subValue}`
                                                    }}</NuxtLink
                                                >
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Placeholder>
            </UCard>
            <UCard class="mt-4 w-1/2 border-2 border-teal-400">
                <template #header>
                    <SubHeading :title="$t('data.gdpr')" />
                </template>
                <!--<SubHeading v-if="Object.keys(workflowStatus).length" :title="$t('data.gdpr')" class="mt-4 mb-2" />-->
                <Placeholder class="h-16">
                    <ul class="w-full flex ml-1 mr-5 mb-8">
                        <li
                            v-for="msg in gdprMessages"
                            :key="msg.id"
                            class="w-full flex mt-2 ml-2 mb-2 mr-2 bg-green-400 items-center border-2 border-green-400 shadow rounded-lg cursor-move text-sm font-medium"
                        >
                            <div class="rounded-m ml-5 mt-2 mb-2 mr-1 font-medium text-black font-normal">
                                {{ msg.text }}
                            </div>
                        </li>
                    </ul>
                </Placeholder>
            </UCard>
        </div>

        <div class="w-full flex items-end gap-4">
            <ChartContainer :title="$t('data.workflowExecutionList')" class="mt-6 h-[450px] relative">
                <template #right-header>
                    <UInput v-model="assetsSearchString" size="md" :placeholder="$t('search')" class="w-full ml-6" />
                </template>
                <UTable
                    v-model:sort="assetsSortBy"
                    :columns="assetsColumns"
                    :rows="assetsPaginatedRows"
                    sort-mode="manual"
                >
                    <template #dag_run_id-data="{ row }">
                        <NuxtLink
                            :to="'/data/workflow-execution'"
                            class="text-sm text-blue-500 underline"
                            @click="getWorkflowRun(row.dag_run_id)"
                            >{{ row.dag_run_id }}</NuxtLink
                        >
                    </template>
                    <template #state-data="{ row }">
                        <div class="text-center">
                            <span
                                :class="[
                                    'rounded-md px-4 py-1 font-medium',
                                    row.state === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                                ]"
                                >{{ row.state }}
                            </span>
                        </div>
                    </template>
                </UTable>
                <UPagination
                    v-if="assetsFilteredRows.length > assetsPageCount"
                    v-model="assetsPage"
                    :page-count="assetsPageCount"
                    :total="assetsFilteredRows.length"
                    class="absolute bottom-2 right-6"
                />
            </ChartContainer>
        </div>
    </PageContainer>
</template>
