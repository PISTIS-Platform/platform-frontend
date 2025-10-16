<script setup lang="ts">
const { t } = useI18n();

// const { copy: copyAsset, copied: copiedAsset } = useClipboard({});
// const { copy: copyTransaction, copied: copiedTransaction } = useClipboard({});
// const { copy: copyProvider, copied: copiedProvider } = useClipboard({});
// const { copy: copyConsumer, copied: copiedConsumer } = useClipboard({});
// const { copy: copyProviderId, copied: copiedProviderId } = useClipboard({});
// const { copy: copyConsumerId, copied: copiedConsumerId } = useClipboard({});

const columns = [
    {
        key: 'createdAt',
        label: t('auditor.date'),
        sortable: true,
        class: 'text-center w-12',
    },
    {
        key: 'amount',
        label: t('auditor.amount'),
        sortable: true,
        class: 'text-center w-12 text-nowrap',
    },
    {
        key: 'assetName',
        label: t('auditor.assetName'),
        sortable: false,
        class: 'text-left',
    },
    {
        key: 'factorySellerName',
        label: t('auditor.provider'),
        sortable: true,
        class: 'text-left w-12',
    },
    {
        key: 'factoryBuyerName',
        label: t('auditor.consumer'),
        sortable: true,
        class: 'text-left w-12',
    },
];

const page = ref(1);

const data = computed(() => transactionsData.value.data);

const { rows, sortBy, searchString } = useTable(data, 15, {
    column: 'createdAt',
    direction: 'desc',
});

const rawInput = ref('');
let timeout = null;

//debounce the search bar
watch(rawInput, (newVal) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        searchString.value = newVal;
    }, 500);
});

const sortByColumn = computed(() => sortBy.value.column);
const sortByDirection = computed(() => sortBy.value.direction);

const totalCount = computed(() => transactionsData.value.meta.totalItems);

const {
    data: transactionsData,
    status: transactionsStatus,
    error,
} = useFetch<any>(`/api/wallet/transactions`, {
    method: 'GET',
    query: {
        page,
        sortByColumn,
        sortByDirection,
        searchString,
    },
});

const truncateId = (item: string, length: number) => {
    return item.length > length ? item.slice(0, length) + '...' : item;
};

const selected = ref();

const select = (item: any) => {
    selected.value = item;
    modalOpen.value = true;
};

const modalOpen = ref(false);

const expand = ref({
    openedRows: [],
    row: null,
});
</script>

<template>
    <div class="justify-center items-center px-8 max-w-7xl mx-auto w-full pt-6">
        <ErrorCard v-if="error" :error-msg="error.data?.data?.message" class="mt-6" />
        <PageContainer v-else>
            <span class="font-bold text-lg">{{ $t('auditor.title') }}</span>
            <div v-if="transactionsStatus === 'pending'" class="flex flex-col w-full text-lg mt-4">
                <UProgress animation="carousel" color="primary" />
            </div>
            <div v-else class="w-full mt-4">
                <UCard>
                    <div class="w-full flex items-center justify-end">
                        <UInput
                            v-model="rawInput"
                            icon="i-heroicons-magnifying-glass-20-solid"
                            size="md"
                            color="white"
                            :trailing="false"
                            :placeholder="$t('auditor.inputMessage')"
                            class="w-64"
                        />
                    </div>

                    <UTable
                        v-model:sort="sortBy"
                        v-model:expand="expand"
                        :columns="columns"
                        :rows="rows"
                        :empty-state="{
                            icon: 'i-heroicons-circle-stack-20-solid',
                            label: $t('wallet.noTransactions'),
                        }"
                        :single-select="true"
                        :multiple-expand="true"
                        @select="select"
                    >
                        <template #createdAt-data="{ row }">
                            <span v-if="row.createdAt" class="flex items-center justify-center">{{
                                $d(new Date(row.createdAt), 'short')
                            }}</span>
                            <span v-else>&mdash;</span>
                        </template>

                        <template #amount-data="{ row }">
                            <span class="flex items-center justify-center font-bold">
                                {{ row.amount.toFixed(2) }} EUR
                            </span>
                        </template>

                        <template #assetName-data="{ row }">
                            <span class="flex items-center justify-start">
                                <span>
                                    {{ row.assetName }}
                                </span>
                            </span>
                        </template>

                        <template #factorySellerName-data="{ row }">
                            <UTooltip
                                :text="row.factorySellerName"
                                :ui="{ width: 'max-w-lg' }"
                                :popper="{ placement: 'top' }"
                                class="flex items-center justify-center"
                            >
                                <span class="flex items-center justify-start">
                                    {{ truncateId(row.factorySellerName, 10) }}
                                </span>
                            </UTooltip>
                        </template>

                        <template #factoryBuyerName-data="{ row }">
                            <UTooltip
                                :text="row.factoryBuyerName"
                                :ui="{ width: 'max-w-lg' }"
                                :popper="{ placement: 'top' }"
                                class="flex items-center justify-center"
                            >
                                <span class="flex items-center justify-start">
                                    {{ truncateId(row.factoryBuyerName, 10) }}
                                </span>
                            </UTooltip>
                        </template>
                    </UTable>
                    <div class="flex justify-end mt-2">
                        <UPagination
                            v-model="page"
                            :page-count="10"
                            :total="totalCount"
                            :active-button="{ variant: 'outline' }"
                        />
                    </div>
                </UCard>
            </div>
        </PageContainer>
    </div>
</template>

<style scoped>
::v-deep tr td:first-child {
    width: 50px !important;
}
</style>
