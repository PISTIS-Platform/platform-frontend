<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import FactoryModelRepo from '~/interfaces/factories-model';

const { isSuccessResponse } = useHttpHelper();
const { showSuccessMessage, showErrorMessage } = useAlertMessage();

const { t } = useI18n();

const { data } = await useFetch(`/api/factories-registrant/factories`);

const switchModalOpen = ref<boolean>(false);
let selectedRow: FactoryModelRepo;

const columns = [
    {
        key: 'organizationName',
        label: t('admin.services.factoryConnectors.name'),
        sortable: true,
    },
    {
        key: 'ip',
        label: t('admin.services.factoryConnectors.ip'),
        sortable: true,
    },
    {
        key: 'country',
        label: t('admin.services.factoryConnectors.country'),
        sortable: true,
    },
    {
        key: 'actions',
        label: `${t('admin.services.factoryConnectors.activate')} / ${t(
            'admin.services.factoryConnectors.deactivate',
        )}`,
        class: 'text-center',
    },
];

const page = ref<number>(1);
const pageCount: number = 5;

const rows = computed(() => {
    return data.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});

const getStatusColorClass = (status: string) => {
    return {
        'text-green-500': status === 'live',
        'text-red-500': status === 'deactivated',
        'text-yellow-500': status === 'pending',
    };
};

const select = (row: any) => {
    if (row.status !== 'pending') {
        return;
    } else {
        selectedRow = row;
        return (switchModalOpen.value = true);
    }
};

const acceptFactory = (data: string) => {
    const body = { acceptance: data };
    $fetch(`/api/factories-registrant/${selectedRow.id}`, {
        method: 'patch',
        body,
        onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
                if (data === 'accept') {
                    showSuccessMessage(t('admin.services.factoryConnectors.factoryAccepted'));
                } else {
                    showSuccessMessage(t('admin.services.factoryConnectors.factoryDenied'));
                }
            } else {
                showErrorMessage(t('admin.services.factoryConnectors.factoryError'));
            }
            switchModalOpen.value = !switchModalOpen;
        },
        onResponseError() {
            switchModalOpen.value = !switchModalOpen;
            showErrorMessage(t('admin.services.factoryConnectors.factoryError'));
        },
    });
};

const toggleActive = (row: any) => {
    if (row.isActive === true) {
        row.status = 'deactivated';
        row.isActive = false;
    } else {
        row.isActive = true;
        row.status = 'live';
    }
    $fetch(`/api/factories-registrant/${row.id}/`, {
        method: 'put',
        body: row,
        async onResponse({ response }) {
            if (isSuccessResponse(response.status)) {
                if ((row.status = 'live')) {
                    showSuccessMessage(t('admin.services.factoryConnectors.activate'));
                } else {
                    showSuccessMessage(t('admin.services.factoryConnectors.Deactivate'));
                }
            } else {
                showErrorMessage(t('admin.services.factoryConnectors.factoryActivationError'));
            }
        },
        onResponseError() {
            showErrorMessage(t('admin.services.factoryConnectors.factoryActivationError'));
        },
    });
    return row;
};
</script>

<template>
    <PageContainer>
        <!-- Factory Connectors -->
        <div class="flex flex-col w-full mt-8">
            <UCard>
                <template #header>
                    <SubHeading :title="$t('admin.services.factoryConnectors.title')" />
                </template>

                <UTable :columns="columns" :rows="rows" @select="select">
                    <!-- Custom styling for ip data column -->
                    <template #ip-data="{ row }">
                        <span class="flex items-center">
                            <UIcon
                                name="i-heroicons-light-bulb-solid"
                                :class="[getStatusColorClass(row.status), 'mr-2']"
                            />
                            {{ row.ip }}
                        </span>
                    </template>
                    <template #actions-data="{ row }">
                        <div class="justify-center flex">
                            <UToggle :model-value="row.isActive" @click="toggleActive(row)" />
                        </div>
                    </template>
                </UTable>

                <!-- Display the pagination only if the total number of transactions is larger than the page count -->
                <div v-if="data.length > pageCount" class="flex justify-end mt-2">
                    <UPagination v-model="page" :page-count="pageCount" :total="data.length" />
                </div>
            </UCard>
            <UModal v-model="switchModalOpen">
                <UCard class="flex flex-col justify-center items-center text-center text-gray-700 h-40">
                    <p class="font-bold text-xl">{{ $t('admin.services.factoryConnectors.factoryModal') }}</p>
                    {{ selectedRow.ip }} - {{ selectedRow.organizationName }}
                    <div class="flex gap-8 w-full justify-center mt-6">
                        <UButton color="white" class="w-20 flex justify-center" @click="acceptFactory('accept')">{{
                            $t('admin.services.factoryConnectors.accept')
                        }}</UButton>
                        <UButton class="w-20 flex justify-center" @click="acceptFactory('deny')">{{
                            $t('admin.services.factoryConnectors.deny')
                        }}</UButton>
                    </div>
                </UCard>
            </UModal>
        </div>
    </PageContainer>
</template>
