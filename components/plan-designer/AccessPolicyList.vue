<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { clone } from 'ramda';
import { useI18n } from 'vue-i18n';
import { DialogWrapper } from 'vue3-promise-dialog';

import { confirmation } from '~/composables/confirmation';
import type { AccessPolicyDetails } from '~/interfaces/plan-designer';

const { showErrorMessage } = useAlertMessage();
const { t } = useI18n();

const props = defineProps({
    selected: {
        type: Object,
        required: true,
    },
    policyData: {
        type: Array<AccessPolicyDetails>,
        required: true,
    },
});

// const allGroups = await useFetch('/api/iam/get-groups');
const allDomains = await useFetch<any>('/api/iam/get-domains');
const allCountries = await useFetch<any>('/api/iam/get-countries');
const allSizes = await useFetch<any>('/api/iam/get-sizes');
const allTypes = await useFetch<any>('/api/iam/get-types');
const groupOptions = await useFetch<any>('/api/iam/get-organizations');

const checkedScopes = ref<Array<boolean>>([]);
const checkedGroups = ref<Array<boolean>>([]);
const checkedCountries = ref<Array<boolean>>([]);
const checkedSizes = ref<Array<boolean>>([]);
const checkedDomains = ref<Array<boolean>>([]);
const checkedTypes = ref<Array<boolean>>([]);

const policyData = clone(props.policyData);
const policiesCount = ref(props.policyData.length);
const accessPolicyDetails = ref<AccessPolicyDetails>({
    id: undefined,
    title: undefined,
    description: undefined,
    default: false,
    scopes: [],
    groups: [],
    countries: [],
    sizes: [],
    domains: [],
    types: [],
});

const emit = defineEmits(['changePage', 'update:policy-data']);

const handleEditPolicyClick = (row: any) => {
    accessPolicyDetails.value = policyData[row.id - 1];

    checkedScopes.value[0] = false;
    checkedScopes.value[1] = false;
    if (accessPolicyDetails.value.scopes.includes('READ')) {
        checkedScopes.value[0] = true;
    }
    if (accessPolicyDetails.value.scopes.includes('TRADE')) {
        checkedScopes.value[1] = true;
    }

    checkedGroups.value = accessPolicyDetails.value.groups;

    for (let i = 0; i < allDomains.data.value.length; i++) {
        if (accessPolicyDetails.value.domains.includes(allDomains.data.value[i].code)) {
            checkedDomains.value[i] = true;
        } else {
            checkedDomains.value[i] = false;
        }
    }

    for (let i = 0; i < allCountries.data.value.length; i++) {
        if (accessPolicyDetails.value.countries.includes(allCountries.data.value[i].code)) {
            checkedCountries.value[i] = true;
        } else {
            checkedCountries.value[i] = false;
        }
    }

    for (let i = 0; i < allSizes.data.value.length; i++) {
        if (accessPolicyDetails.value.sizes.includes(allSizes.data.value[i].code)) {
            checkedSizes.value[i] = true;
        } else {
            checkedSizes.value[i] = false;
        }
    }

    for (let i = 0; i < allTypes.data.value.length; i++) {
        if (accessPolicyDetails.value.types.includes(allTypes.data.value[i].code)) {
            checkedTypes.value[i] = true;
        } else {
            checkedTypes.value[i] = false;
        }
    }

    switchPolicyForm.value = true;
};

const columns = [
    {
        key: 'id',
        label: t('policies.tableFields.id'),
        direction: 'asc',
        class: 'w-1/12',
    },
    {
        key: 'title',
        label: t('policies.tableFields.title'),
        sortable: true,
        direction: 'asc',
        class: 'w-2/12',
    },
    {
        key: 'description',
        label: t('policies.tableFields.desc'),
        sortable: true,
        direction: 'asc',
        class: 'w-8/12',
    },
    {
        key: 'actions',
        class: 'w-1/12',
    },
];
const actions = (row: any) => {
    return [
        [
            {
                label: t('policies.actions.edit'),
                icon: 'i-heroicons-pencil-square-20-solid',
                click: () => {
                    handleEditPolicyClick(row);
                },
            },
            {
                label: t('policies.actions.delete'),
                icon: 'i-heroicons-trash-20-solid',
                click: async () => {
                    if (await confirmation(t('policies.delete.title'), t('policies.delete.text'))) {
                        policyData.splice(
                            policyData.findIndex((item) => item.id === row.id),
                            1,
                        );
                        policiesCount.value = policyData.length;
                        emit('update:policy-data', policyData);
                        page.value = policyData.length / pageCount;
                        page.value = 1;
                    }
                },
            },
        ],
    ];
};
const page = ref<number>(1);
const pageCount: number = 5;

const rows = computed(() => {
    return policyData.slice((page.value - 1) * pageCount, page.value * pageCount);
});
watch(
    rows,
    () => {
        policiesCount.value = policyData.length;
        emit('update:policy-data', policyData);
    },
    { immediate: true },
);

const tabItems = [
    {
        key: 'domain',
        label: t('policies.tabs.domain.label'),
        icon: 'i-heroicons-tag',
        content: t('policies.tabs.domain.content'),
    },
    {
        key: 'country',
        label: t('policies.tabs.country.label'),
        icon: 'i-heroicons-flag',
        content: t('policies.tabs.country.content'),
    },
    {
        key: 'size',
        label: t('policies.tabs.size.label'),
        icon: 'i-heroicons-briefcase',
        content: t('policies.tabs.size.content'),
    },
    {
        key: 'type',
        label: t('policies.tabs.type.label'),
        icon: 'i-heroicons-eye-dropper',
        content: t('policies.tabs.type.content'),
    },
];

const switchPolicyForm = ref(false);
const handleNewPolicyClick = () => {
    accessPolicyDetails.value = {
        id: undefined,
        title: undefined,
        description: undefined,
        default: false,
        scopes: [],
        groups: [],
        countries: [],
        sizes: [],
        domains: [],
        types: [],
    };
    checkedScopes.value[0] = false;
    checkedScopes.value[1] = false;
    checkedGroups.value = [];
    for (let i = 0; i < allDomains.data.value.length; i++) {
        checkedDomains.value[i] = false;
    }
    for (let i = 0; i < allCountries.data.value.length; i++) {
        checkedCountries.value[i] = false;
    }
    for (let i = 0; i < allSizes.data.value.length; i++) {
        checkedSizes.value[i] = false;
    }
    for (let i = 0; i < allTypes.data.value.length; i++) {
        checkedTypes.value[i] = false;
    }

    switchPolicyForm.value = true;
};

const handlePolicyForm = () => {
    let scopes = [];
    if (checkedScopes.value[0]) {
        scopes.push('READ');
    }
    if (checkedScopes.value[1]) {
        scopes.push('TRADE');
    }

    let groups = [];
    for (let i = 0; i < checkedGroups.value.length; i++) {
        groups.push(checkedGroups.value[i].toString());
    }

    let countries = [];
    for (let i = 0; i < allCountries.data.value.length; i++) {
        if (checkedCountries.value[i] === true) {
            countries.push(allCountries.data.value[i].code);
        }
    }

    let sizes = [];
    for (let i = 0; i < allSizes.data.value.length; i++) {
        if (checkedSizes.value[i] === true) {
            sizes.push(allSizes.data.value[i].code);
        }
    }

    let domains = [];
    for (let i = 0; i < allDomains.data.value.length; i++) {
        if (checkedDomains.value[i] === true) {
            domains.push(allDomains.data.value[i].code);
        }
    }

    let types = [];
    for (let i = 0; i < allTypes.data.value.length; i++) {
        if (checkedTypes.value[i] === true) {
            types.push(allTypes.data.value[i].code);
        }
    }

    //console.log(accessPolicyDetails.value);
    let isValid = true;
    let errorKeys = [];
    if (accessPolicyDetails.value.title === undefined || accessPolicyDetails.value.title.length < 5) {
        isValid = false;
        errorKeys.push('policies.errors.title');
    }
    if (accessPolicyDetails.value.description === undefined || accessPolicyDetails.value.description.length < 15) {
        isValid = false;
        errorKeys.push('policies.errors.description');
    }
    if (scopes.length === 0) {
        isValid = false;
        errorKeys.push('policies.errors.scopes');
    }
    if (
        groups.length === 0 &&
        countries.length === 0 &&
        sizes.length === 0 &&
        domains.length === 0 &&
        types.length === 0
    ) {
        isValid = false;
        errorKeys.push('policies.errors.attributes');
    }
    if (!isValid) {
        for (let i = 0; i < errorKeys.length; i++) {
            showErrorMessage(t(errorKeys[i]));
        }
    } else {
        let p: Record<string, any> = {};
        if (accessPolicyDetails.value.id === undefined || accessPolicyDetails.value.id === null) {
            p.id = (policyData?.length + 1).toString();
        } else {
            p.id = accessPolicyDetails.value.id;
        }

        p.title = accessPolicyDetails.value.title;
        p.description = accessPolicyDetails.value.description;
        p.default = false;
        p.scopes = scopes;
        p.groups = groups;
        p.countries = countries;
        p.sizes = sizes;
        p.domains = domains;
        p.types = types;

        if (accessPolicyDetails.value.id === undefined || accessPolicyDetails.value.id === null) {
            policyData.push(p as unknown as AccessPolicyDetails);
        } else {
            policyData[p.id - 1] = p as unknown as AccessPolicyDetails;
        }

        //const updatedPolicyData = [...props.policyData, p];
        //props.policyData = updatedPolicyData;
        emit('update:policy-data', policyData);
        //console.log(JSON.stringify(policyData));
        switchPolicyForm.value = false;
        //console.log(policiesCount.value);
        page.value = Math.floor(policyData.length / pageCount) + 2;
        page.value = 1;
    }
};

async function onSubmit(): Promise<void> {
    emit('changePage', 3);
}
</script>

<template>
    <DialogWrapper />
    <Transition
        enter-active-class="duration-300 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
    >
        <UForm ref="formRef" class="flex flex-col w-full" @submit="onSubmit">
            <UCard>
                <template #header>
                    <SubHeading :title="$t('policies.title')" :info="$t('policies.info')" />
                </template>

                <UTable :key="policiesCount" :columns="columns" :rows="rows">
                    <template #amount-data="{ row }">
                        <div class="text-left font-semibold">
                            <span>{{ row.id }}</span>
                        </div>
                    </template>

                    <template #actions-data="{ row }">
                        <div v-if="row.id === '1'"></div>
                        <div v-else>
                            <UDropdown :items="actions(row)">
                                <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                            </UDropdown>
                        </div>
                    </template>
                </UTable>

                <!-- Display the pagination only if the total number of transactions is larger than the page count -->
                <div v-if="policyData.length > pageCount" class="flex justify-end mt-2">
                    <UPagination v-model="page" :page-count="pageCount" :total="policyData.length" />
                </div>

                <UButton @click="handleNewPolicyClick()">{{ $t('policies.actions.add') }}</UButton>
            </UCard>
            <div class="w-full flex items-center justify-between mt-4">
                <UButton size="lg" color="gray" variant="outline" @click="emit('changePage', 2)">
                    {{ $t('back') }}
                </UButton>
                <UButton size="md" type="submit">{{ $t('next') }} </UButton>
            </div>
        </UForm>
    </Transition>
    <!-- Modal -->
    <UModal v-model="switchPolicyForm" class="flex flex-grow">
        <UCard class="flex flex-col text-gray-700">
            <UAlert :title="t('policies.policyUI.title')" color="primary" />
            <UInput :value="props.selected.id" color="gray" variant="outline" disabled class="flex-grow">
                <template #leading>
                    <span class="text-gray-500 dark:text-gray-400 text-xs">{{ t('policies.policyUI.assetId') }}</span>
                </template>
            </UInput>
            <UInput :value="props.selected.title" color="gray" variant="outline" disabled class="flex-grow">
                <template #leading>
                    <span class="text-gray-500 dark:text-gray-400 text-xs">{{
                        t('policies.policyUI.assetTitle')
                    }}</span>
                </template>
            </UInput>

            <UAlert :title="t('policies.policyUI.defText')" class="mt-5" color="primary" />

            <input v-model="accessPolicyDetails.id" type="hidden" />
            <div class="flex items-start gap-8">
                <div class="flex flex-col w-full">
                    <UFormGroup :label="$t('policies.policyUI.defName')">
                        <UInput v-model="accessPolicyDetails.title" placeholder="" />
                    </UFormGroup>
                </div>
            </div>
            <div class="flex items-start gap-8">
                <div class="flex flex-col w-full">
                    <UFormGroup :label="$t('policies.policyUI.defDesc')">
                        <UTextarea v-model="accessPolicyDetails.description" placeholder="" />
                    </UFormGroup>
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700">{{ t('policies.policyUI.defScope') }}</label>
                    <small class="mb-2">{{ t('policies.policyUI.defScopeHelp') }}</small>
                    <div class="flex flex-row w-full">
                        <div class="flex gap-2 flex-col w-1/5">
                            <UCheckbox v-model="checkedScopes[0]" name="scopes[]" label="READ" />
                        </div>
                        <div class="flex gap-2 flex-col w-1/5">
                            <UCheckbox v-model="checkedScopes[1]" name="scopes[]" label="TRADE" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{
                        t('policies.policyUI.defOrg')
                    }}</label>
                    <small class="mb-2">{{ t('policies.policyUI.defOrgHelp') }}</small>
                    <div class="flex flex-row flex-wrap mb-2 gap-4">
                        <USelectMenu
                            v-model="checkedGroups"
                            searchable
                            :searchable-placeholder="$t('policies.policyUI.defOrgPrompt')"
                            :options="groupOptions.data.value"
                            multiple
                            :placeholder="$t('policies.policyUI.defOrgPrompt')"
                            class="w-full"
                        >
                            <template #label>
                                <span v-if="checkedGroups.length" class="truncate">{{ checkedGroups.join(', ') }}</span>
                                <span v-else>{{ t('policies.policyUI.defOrgPrompt') }}</span>
                            </template>
                        </USelectMenu>
                    </div>
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{
                        t('policies.policyUI.defAttr')
                    }}</label>
                    <small class="mb-2">{{ t('policies.policyUI.defAttrHelp') }}</small>
                </div>
            </div>

            <UTabs :items="tabItems" class="w-full">
                <template #item="{ item }">
                    <UCard>
                        <template #header>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {{ item.content }}
                            </p>
                        </template>

                        <div v-if="item.key === 'domain'" class="space-y-3">
                            <div class="flex flex-col w-full">
                                <div class="flex flex-row flex-wrap mb-2 gap-4">
                                    <UCheckbox
                                        v-for="(attr, index) in allDomains.data.value"
                                        :key="attr.code"
                                        v-model="checkedDomains[index]"
                                        name="domains[]"
                                        :label="attr.title"
                                    />
                                </div>
                            </div>
                        </div>

                        <div v-else-if="item.key === 'country'" class="space-y-3">
                            <div class="flex flex-col w-full">
                                <div class="flex flex-row flex-wrap mb-2 gap-4">
                                    <UCheckbox
                                        v-for="(attr, index) in allCountries.data.value"
                                        :key="attr.code"
                                        v-model="checkedCountries[index]"
                                        name="countries[]"
                                        :label="attr.title"
                                    />
                                </div>
                            </div>
                        </div>

                        <div v-else-if="item.key === 'size'" class="space-y-3">
                            <div class="flex flex-col w-full">
                                <div class="flex flex-row flex-wrap mb-2 gap-4">
                                    <UCheckbox
                                        v-for="(attr, index) in allSizes.data.value"
                                        :key="attr.code"
                                        v-model="checkedSizes[index]"
                                        name="sizes[]"
                                        :label="attr.title"
                                    />
                                </div>
                            </div>
                        </div>

                        <div v-else-if="item.key === 'type'" class="space-y-3">
                            <div class="flex flex-col w-full">
                                <div class="flex flex-row flex-wrap mb-2 gap-4">
                                    <UCheckbox
                                        v-for="(attr, index) in allTypes.data.value"
                                        :key="attr.code"
                                        v-model="checkedTypes[index]"
                                        name="types[]"
                                        :label="attr.title"
                                    />
                                </div>
                            </div>
                        </div>
                    </UCard>
                </template>
            </UTabs>

            <div class="flex gap-8 w-full justify-center mt-6">
                <UButton color="white" class="w-20 flex justify-center" @click="switchPolicyForm = false">{{
                    $t('cancel')
                }}</UButton>
                <UButton class="w-20 flex justify-center" @click="handlePolicyForm()">{{
                    $t('policies.actions.save')
                }}</UButton>
            </div>
        </UCard>
    </UModal>
</template>

<style lang="css">
.policy-modal {
    @apply w-96;
}
@media (min-width: 640px) {
    .sm\:max-w-lg {
        max-width: 72rem;
    }
}
@media (min-width: 640px) {
    .dialog .sm\:max-w-lg {
        max-width: 36rem;
    }
}
</style>
