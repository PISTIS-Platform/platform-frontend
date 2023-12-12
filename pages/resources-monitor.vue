<script lang="ts" setup>
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

import DataModelRepo from '~/interfaces/data-model-repo';

import { data, options, pieData, resourcesData } from './resources-monitor-data';

const { t } = useI18n();
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);
const connectorsData = computed(() => resourcesData);

const columns = [
    {
        key: 'asset',
        label: t('admin.resources.tableFields.asset'),
        // direction: 'asc',
        class: 'w-1/12',
    },
    {
        key: 'transactionDate',
        label: `${t('admin.resources.tableFields.date')}`,
        // sortable: true,
        class: 'w-1/3 text-slate-600 text-center',
    },
    {
        key: 'monetisationPlan',
        label: t('admin.resources.tableFields.plan'),
        // sortable: true,
        direction: 'asc',
        class: 'w-1/3',
    },
    {
        key: 'transactionId',
        label: `${t('admin.resources.tableFields.transactionId')}`,
        class: 'w-1/6 text-slate-600 text-center',
    },
    { key: 'details', label: '', sortable: false, class: 'w-1/12 text-center' },
];

const cardInfoCPU = [
    {
        title: t('admin.resources.cardsFields.inUse'),
        amount: 0.25 + ' cores',
    },
    {
        title: t('admin.resources.cardsFields.total'),
        amount: 8 + ' cores',
    },
];

const cardInfoDisk = [
    {
        title: t('admin.resources.cardsFields.inUse'),
        amount: 0.25 + ' GB',
    },
    {
        title: t('admin.resources.cardsFields.total'),
        amount: 10 + ' GB',
    },
];

const cardInfoMemory = [
    {
        title: t('admin.resources.cardsFields.inUse'),
        amount: 1.87 + ' GB',
    },
    {
        title: t('admin.resources.cardsFields.total'),
        amount: 16 + ' GB',
    },
];

const topCards = [
    {
        title: t('admin.resources.cardsFields.factories'),
        amount: 3000,
    },
    {
        title: t('admin.resources.cardsFields.users'),
        amount: 100,
    },
    {
        title: t('admin.resources.cardsFields.assets'),
        amount: 30000,
    },
];

const selected = ref<DataModelRepo[]>([]);

const details = (row: DataModelRepo[]) => [
    [
        {
            label: 'View',
            icon: 'i-heroicons-eye-20-solid',
            click: () => editRepo(row),
        },
    ],
];

async function editRepo(row: DataModelRepo[]) {
    console.log(row);
    await navigateTo({
        path: '/data/add-data-model-repository',
        query: {
            data: JSON.stringify(selected.value),
        },
    });
}

const page = ref<number>(1);
const pageCount: number = 5;

const rows = computed(() => {
    return connectorsData.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});
</script>

<template>
    <PageContainer>
        <div class="flex flex-col w-full mt-8">
            <UCard>
                <template #header>
                    <SubHeading :title="$t('admin.resources.title')" />
                </template>
                <div class="flex flex-row w-full space-x-2 mt-2">
                    <MonitoringCard
                        v-for="card in topCards"
                        :key="card.title"
                        class="w-full"
                        :title="card.title"
                        :amount="card.amount"
                    />
                </div>
                <div class="flex flex-row space-x-2 mt-4">
                    <UCard class="w-1/3 h-1/2">
                        <div>
                            <h3>CPU Usage</h3>
                            <Doughnut class="w-full h-full" :data="pieData" :options="options" />
                        </div>
                        <hr class="solid w-full mt-2" />
                        <div class="flex flex-row w-full space-x-4 mt-2">
                            <MonitoringCard
                                v-for="card in cardInfoCPU"
                                :key="card.title"
                                class="w-full"
                                :title="card.title"
                                :amount="card.amount"
                            />
                        </div>
                    </UCard>
                    <UCard class="w-1/3 h-1/2">
                        <div>
                            <h3>Disk Utilasation</h3>
                            <Doughnut class="w-full h-full" :data="pieData" :options="options" />
                        </div>
                        <hr class="solid w-full mt-2" />
                        <div class="flex flex-row w-full space-x-4 mt-2">
                            <MonitoringCard
                                v-for="card in cardInfoDisk"
                                :key="card.title"
                                class="w-full"
                                :title="card.title"
                                :amount="card.amount"
                            />
                        </div>
                    </UCard>
                    <UCard class="w-1/3 h-1/2">
                        <div>
                            <h3>Memory Utilisation</h3>
                            <Doughnut class="w-full h-full" :data="pieData" :options="options" />
                        </div>
                        <hr class="solid w-full mt-2" />
                        <div class="flex flex-row w-full space-x-4 mt-2">
                            <MonitoringCard
                                v-for="card in cardInfoMemory"
                                :key="card.title"
                                class="w-full"
                                :title="card.title"
                                :amount="card.amount"
                            />
                        </div>
                    </UCard>
                </div>

                <div class="flex flex-row space-x-2 mt-4">
                    <UCard class="w-full">
                        <div>
                            <h3>Weekly Transactions</h3>
                            <Bar class="w-full h-full" :data="data" :options="options" />
                        </div>
                    </UCard>
                    <UCard class="w-full">
                        <div class="w-full">
                            <h3 class="pl-4">Weekly Money Circulated</h3>
                            <Bar class="w-full h-full" :data="data" :options="options" />
                        </div>
                    </UCard>
                </div>
                <UCard class="w-full mt-4">
                    <UTable :columns="columns" :rows="rows">
                        <template #details-data="{ row }">
                            <UDropdown :items="details(row)">
                                <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-vertical-20-solid" />
                            </UDropdown>
                        </template>
                    </UTable>
                </UCard>

                <!-- Display the pagination only if the total number of transactions is larger than the page count -->
                <div v-if="connectorsData.length > pageCount" class="flex justify-end mt-2">
                    <UPagination v-model="page" :page-count="pageCount" :total="connectorsData.length" />
                </div>
            </UCard>
        </div>
    </PageContainer>
</template>
