<script setup lang="ts">
const { t } = useI18n();
import { useClipboard } from '@vueuse/core';
import dayjs from 'dayjs';
import htmlToPdfmake from 'html-to-pdfmake';
import * as R from 'ramda';

const { data: session } = useAuth();

const currentBalance = ref();
const isLoadingWallet = ref(true);

const { copy: copyAsset, copied: copiedAsset } = useClipboard({});
const { copy: copyTransaction, copied: copiedTransaction } = useClipboard({});

const truncateId = (item: string, length: number) => {
    return item.length > length ? item.slice(0, length) + '...' : item;
};

await useLazyFetch(`/api/wallet`, {
    method: 'post',
    async onResponse({ response }) {
        currentBalance.value = response._data;
        isLoadingWallet.value = false;
    },
});

//cards info data
const cardInfoData = computed(() => [
    {
        title: t('transactions.monthlyIncome'),
        iconName: 'i-heroicons-banknotes-20-solid',
        amount: incoming.value.toFixed(2),
        textColor: 'text-green-800',
    },
    {
        title: t('transactions.monthlyExpenses'),
        iconName: 'i-heroicons-briefcase-solid',
        amount: outgoing.value.toFixed(2),
        textColor: 'text-red-800',
    },
    {
        title: t('data.wallet.balance'),
        iconName: 'i-heroicons-currency-dollar-20-solid',
        amount: !R.isNil(currentBalance.value?.dlt_amount) ? currentBalance.value?.dlt_amount.toFixed(2) : 'N/A',
        textColor: 'text-green-800',
    },
]);

const columns = [
    {
        key: 'createdAt',
        label: t('transactions.date'),
        sortable: true,
        class: 'text-center w-12',
    },
    {
        key: 'type',
        label: t('transactions.type'),
        class: 'text-center w-12',
    },
    {
        key: 'amount',
        label: t('transactions.amount'),
        sortable: true,
        class: 'text-center w-12 text-nowrap',
    },
    {
        key: 'assetName',
        label: t('transactions.assetName'),
        sortable: true,
        class: 'text-left',
    },
    {
        key: 'factorySellerName',
        label: t('transactions.provider'),
        sortable: true,
        class: 'text-center w-12',
    },
    {
        key: 'factoryBuyerName',
        label: t('transactions.consumer'),
        sortable: true,
        class: 'text-center w-12',
    },
];

const page = ref(1);

const data = computed(() => transactionsData.value.data);

const sortBy = ref({ column: 'createdAt', direction: 'desc' });

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
    },
});

const {
    data: transactionsSumsData,
    status: transactionsSumsStatus,
    error: transactionsSumsError,
} = useFetch<any>(`/api/wallet/transactions-sums`, {
    method: 'GET',
});

const incoming = computed(() => transactionsSumsData.value?.incomeTotal || 0);
const outgoing = computed(() => transactionsSumsData.value?.expensesTotal || 0);

const modalOpen = ref(false);
const selected = ref();

const select = (item: any) => {
    selected.value = item;
    modalOpen.value = true;
};

const decodedTerms = computed(() => {
    const termString = selected.value.terms || '';
    try {
        return decodeURIComponent(atob(termString));
    } catch (e) {
        return termString;
    }
});

const generatePDF = () => {
    if (!selected.value) return;

    const { $pdfMake } = useNuxtApp();

    let termsContent: any[] = [];

    if (decodedTerms.value) {
        const safeHtml = decodedTerms.value.includes('<')
            ? decodedTerms.value
            : `<div>${decodedTerms.value.replace(/\n/g, '<br>')}</div>`;

        const convert = (htmlToPdfmake as any).default || htmlToPdfmake;

        try {
            termsContent = convert(safeHtml);
        } catch (e) {
            console.error('PDF HTML conversion failed, falling back to text', e);
            termsContent = [{ text: decodedTerms.value }];
        }
    }

    const docDefinition = {
        content: [
            { text: 'PISTIS - ' + t('transactions.transactionDetails'), style: 'heading' },
            { text: t('transactions.date'), style: 'subheading' },
            { text: dayjs(selected.value.createdAt).format('YYYY-MM-DD HH:mm:ss') },
            { text: t('transactions.transactionId'), style: 'subheading' },
            { text: selected.value.transactionId },
            { text: t('transactions.assetId'), style: 'subheading' },
            { text: selected.value.assetId },
            { text: t('transactions.assetName'), style: 'subheading' },
            {
                text: selected.value.assetName,
            },
            { text: t('transactions.amount'), style: 'subheading' },
            { text: selected.value.amount.toFixed(2) + ' EUR' },
            { text: t('transactions.amountToProvider'), style: 'subheading' },
            {
                text: R.isNil(selected.value.transactionFee)
                    ? `${selected.value.amount.toFixed(2)} EUR`
                    : `${(selected.value.amount - selected.value.transactionFee).toFixed(2)} EUR`,
            },
            { text: t('transactions.transactionFee'), style: 'subheading' },
            {
                text: R.isNil(selected.value.transactionFee)
                    ? 'None'
                    : `${selected.value.transactionFee.toFixed(2)} EUR`,
            },
            { text: t('transactions.provider'), style: 'subheading' },
            { text: selected.value.factorySellerName },

            { text: t('transactions.consumer'), style: 'subheading' },
            { text: selected.value.factoryBuyerName },
            { text: decodedTerms.value ? t('transactions.terms') : '', style: 'subheading' },
            ...termsContent,
        ],
        styles: {
            heading: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
                color: '#705df7',
            },
            subheading: {
                fontSize: 13,
                bold: true,
                margin: [0, 15, 0, 5],
            },
            body: {
                fontSize: 12,
                lineHeight: 1.2,
            },
            link: {
                color: '#705df7',
            },
        },
        pageMargins: [40, 60, 40, 60],
    };

    $pdfMake.createPdf(docDefinition).download(`transaction_details_${selected.value.transactionId}.pdf`);
};
</script>

<template>
    <UModal v-model="modalOpen" :ui="{ width: 'w-full sm:max-w-[1000px]' }" class="text-gray-600 relative">
        <UIcon
            name="material-symbols-light:close"
            class="w-6 h-6 absolute right-2 top-2 cursor-pointer"
            @click="modalOpen = false"
        />
        <UCard>
            <template #header>
                <span class="text-primary-600 font-semibold">{{ $t('transactions.transactionDetails') }}</span>
                <UButton size="xs" icon="fa6-solid:file-pdf" class="focus:outline-none ml-4" @click="generatePDF">{{
                    $t('transactions.downloadPDF')
                }}</UButton>
            </template>
            <div v-if="selected" class="w-full flex flex-col gap-4 text-sm">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                        <span class="text-gray-400">
                            {{ $t('transactions.date') }}
                        </span>
                        <span>{{ dayjs(selected.createdAt).format('DD/MM/YYYY') }}</span>
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="text-gray-400">
                            {{ $t('transactions.transactionId') }}
                        </span>
                        <span
                            >{{ truncateId(selected.transactionId, 20) }}
                            <UIcon
                                name="mingcute:copy-line"
                                class="w-4 h-4 cursor-pointer"
                                @click="copyTransaction(selected.transactionId)"
                            />
                            <UIcon
                                v-show="copiedTransaction"
                                name="ic:baseline-check"
                                class="w-4 h-4 text-green-500 transition-all duration-100"
                            />
                        </span>
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="text-gray-400">
                            {{ $t('transactions.assetId') }}
                        </span>
                        <span
                            >{{ truncateId(selected.assetId, 20) }}
                            <UIcon
                                name="mingcute:copy-line"
                                class="w-4 h-4 cursor-pointer"
                                @click="copyAsset(selected.assetId)"
                            />
                            <UIcon
                                v-show="copiedAsset"
                                name="ic:baseline-check"
                                class="w-4 h-4 text-green-500 transition-all duration-100"
                            />
                        </span>
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="text-gray-400">
                            {{ $t('transactions.assetTitle') }}
                        </span>
                        <span>{{ selected.assetName }}</span>
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="text-gray-400">
                            {{ $t('transactions.fullAmount') }}
                        </span>
                        <span>{{ selected.amount.toFixed(2) }} EUR</span>
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="text-gray-400">
                            {{ $t('transactions.detailedAmount') }}
                        </span>
                        <span
                            >{{ (selected.amount - selected.transactionFee).toFixed(2) }} EUR /
                            {{ selected.transactionFee.toFixed(2) }} EUR</span
                        >
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="text-gray-400">
                            {{ $t('transactions.provider') }}
                        </span>
                        <span>{{ selected.factorySellerName }}</span>
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="text-gray-400">
                            {{ $t('transactions.consumer') }}
                        </span>
                        <span>{{ selected.factoryBuyerName }}</span>
                    </div>
                </div>
                <div v-if="decodedTerms" class="w-full flex flex-col gap-1">
                    <span class="text-gray-400">{{ $t('transactions.terms') }}</span>
                    <div class="max-h-96 flex flex-col gap-2 overflow-y-scroll scrollbar pr-6">
                        <div class="prose text-sm prose-h2:text-center max-w-full" v-html="decodedTerms"></div>
                    </div>
                </div>
            </div>
        </UCard>
    </UModal>
    <div class="justify-center items-center px-8 max-w-7xl mx-auto w-full pt-6">
        <ErrorCard
            v-if="error || transactionsSumsError"
            :error-msg="(error || transactionsSumsError)?.data?.data?.message"
            class="mt-6"
        />
        <PageContainer v-else>
            <div class="flex flex-col md:flex-row gap-6 w-full">
                <WalletCard
                    v-for="card in cardInfoData"
                    :key="card.title"
                    class="w-full md:w-1/3"
                    :title="card.title"
                    :amount="card.amount"
                    :icon-name="card.iconName"
                    :text-color="card.textColor"
                    :loading="isLoadingWallet || transactionsSumsStatus === 'pending'"
                />
            </div>
            <div v-if="transactionsStatus === 'pending'" class="flex flex-col w-full text-lg mt-6">
                <UProgress animation="carousel" color="primary" />
            </div>
            <div v-else class="w-full mt-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between w-full">
                            <span class="font-bold text-lg">{{ $t('transactions.title') }}</span>
                        </div>
                    </template>

                    <UTable
                        v-model:sort="sortBy"
                        sort-mode="manual"
                        :columns="columns"
                        :rows="data"
                        :empty-state="{
                            icon: 'i-heroicons-circle-stack-20-solid',
                            label: $t('data.wallet.noTransactions'),
                        }"
                        :single-select="true"
                        @select="select"
                    >
                        <template #createdAt-data="{ row }">
                            <span v-if="row.createdAt" class="flex items-center justify-center">{{
                                dayjs(row.createdAt).format('DD/MM/YYYY')
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
                                    <a
                                        :href="`/marketplace/dataset-details/${row.assetId}?pm=cloud`"
                                        target="_blank"
                                        class="text-primary"
                                        >{{ row.assetName }}</a
                                    >
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
                                    {{ row.factorySellerName }}
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
                                    {{ row.factoryBuyerName }}
                                </span>
                            </UTooltip>
                        </template>

                        <template #type-data="{ row }">
                            <span class="flex justify-center">
                                <UBadge v-if="row.factoryBuyerId === session?.orgId" variant="subtle" color="red">{{
                                    $t('transactions.outgoing')
                                }}</UBadge>
                                <UBadge v-else variant="subtle" color="green">{{ $t('transactions.incoming') }}</UBadge>
                            </span>
                        </template>
                    </UTable>
                    <div class="flex justify-end mt-2">
                        <UPagination
                            v-if="data"
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
