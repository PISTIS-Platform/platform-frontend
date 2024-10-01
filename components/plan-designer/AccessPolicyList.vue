<script setup lang="ts">
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

const checkedScopes = ref<Array<string>>([]);
const checkedGroups = ref<Array<string>>([]);
const checkedCountries = ref<Array<string>>([]);
const checkedSizes = ref<Array<string>>([]);
const checkedDomains = ref<Array<string>>([]);

const policiesCount = ref(props.policyData.length);
const accessPolicyDetails = ref<AccessPolicyDetails>({
    id: undefined,
    title: undefined,
    description: undefined,
    scopes: [],
    groups: [],
    countries: [],
    sizes: [],
    domains: [],
});

const emit = defineEmits(['changePage', 'update:policy-data']);

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
const actions = (row) => {
    return [
        [
            {
                label: t('policies.actions.edit'),
                icon: 'i-heroicons-pencil-square-20-solid',
                click: () => {
                    accessPolicyDetails.value = props.policyData[row.id - 1];
                    console.log(accessPolicyDetails);
                    checkedScopes.value[0] = String(false);
                    checkedScopes.value[1] = String(false);
                    if (accessPolicyDetails.value.scopes.includes('READ')) {
                        checkedScopes.value[0] = String(true);
                    }
                    if (accessPolicyDetails.value.scopes.includes('TRADE')) {
                        checkedScopes.value[1] = String(true);
                    }

                    for (let i = 0; i < allGroups.value.length; i++) {
                        if (accessPolicyDetails.value.groups.includes(allGroups.value[i].name)) {
                            checkedGroups.value[i] = String(true);
                        } else {
                            checkedGroups.value[i] = String(false);
                        }
                    }

                    for (let i = 0; i < allDomains.value.length; i++) {
                        if (accessPolicyDetails.value.domains.includes(allDomains.value[i].code)) {
                            checkedDomains.value[i] = String(true);
                        } else {
                            checkedDomains.value[i] = String(false);
                        }
                    }

                    for (let i = 0; i < allCountries.value.length; i++) {
                        if (accessPolicyDetails.value.countries.includes(allCountries.value[i].code)) {
                            checkedCountries.value[i] = String(true);
                        } else {
                            checkedCountries.value[i] = String(false);
                        }
                    }

                    for (let i = 0; i < allSizes.value.length; i++) {
                        if (accessPolicyDetails.value.sizes.includes(allSizes.value[i].code)) {
                            checkedSizes.value[i] = String(true);
                        } else {
                            checkedSizes.value[i] = String(false);
                        }
                    }

                    switchPolicyForm.value = true;
                },
            },
            {
                label: t('policies.actions.delete'),
                icon: 'i-heroicons-trash-20-solid',
                click: async () => {
                    if (await confirmation(t('policies.delete.title'), t('policies.delete.text'))) {
                        console.log('User wanted to delete this resource');
                        props.policyData.splice(
                            props.policyData.findIndex((item) => item.id === row.id),
                            1,
                        );
                        policiesCount.value = props.policyData.length;
                        emit('update:policy-data', props.policyData);
                        page.value = props.policyData.length / pageCount;
                        page.value = 1;
                    }
                },
            },
        ],
    ];
};
const page = ref<number>(1);
const pageCount: number = 5;

const { data: allGroups } = useAsyncData(() => $fetch('/api/iam/get-groups'));
const { data: allDomains } = useAsyncData(() => $fetch('/api/iam/get-domains'));
const { data: allCountries } = useAsyncData(() => $fetch('/api/iam/get-countries'));
const { data: allSizes } = useAsyncData(() => $fetch('/api/iam/get-sizes'));

const rows = computed(() => {
    return props.policyData.slice((page.value - 1) * pageCount, page.value * pageCount);
});
watch(
    rows,
    () => {
        policiesCount.value = props.policyData.length;
        emit('update:policy-data', props.policyData);
    },
    { immediate: true },
);
const switchPolicyForm = ref(false);
const handleNewPolicyClick = () => {
    accessPolicyDetails.value = {
        id: undefined,
        title: undefined,
        description: undefined,
        scopes: [],
        groups: [],
        countries: [],
        sizes: [],
        domains: [],
    };
    checkedScopes.value[0] = String(false);
    checkedScopes.value[1] = String(false);
    for (let i = 0; i < allDomains.value.length; i++) {
        checkedDomains.value[i] = String(false);
    }
    for (let i = 0; i < allGroups.value.length; i++) {
        checkedGroups.value[i] = String(false);
    }
    for (let i = 0; i < allCountries.value.length; i++) {
        checkedCountries.value[i] = String(false);
    }
    for (let i = 0; i < allSizes.value.length; i++) {
        checkedSizes.value[i] = String(false);
    }

    switchPolicyForm.value = true;
};

const handlePolicyForm = () => {
    let scopes = [];
    if (checkedScopes.value[0] === true || checkedScopes.value[0] === 'true') {
        scopes.push('READ');
    }
    if (checkedScopes.value[1] === true || checkedScopes.value[1] === 'true') {
        scopes.push('TRADE');
    }

    let groups = [];
    for (let i = 0; i < allGroups.value.length; i++) {
        if (checkedGroups.value[i] === true || checkedGroups.value[i] === 'true') {
            groups.push(allGroups.value[i].name);
        }
    }

    let countries = [];
    for (let i = 0; i < allCountries.value.length; i++) {
        if (checkedCountries.value[i] === true || checkedCountries.value[i] === 'true') {
            countries.push(allCountries.value[i].code);
        }
    }

    let sizes = [];
    for (let i = 0; i < allSizes.value.length; i++) {
        if (checkedSizes.value[i] === true || checkedSizes.value[i] === 'true') {
            sizes.push(allSizes.value[i].code);
        }
    }

    let domains = [];
    for (let i = 0; i < allDomains.value.length; i++) {
        if (checkedDomains.value[i] === true || checkedDomains.value[i] === 'true') {
            domains.push(allDomains.value[i].code);
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
    if (groups.length === 0 && countries.length === 0 && sizes.length === 0 && domains.length === 0) {
        isValid = false;
        errorKeys.push('policies.errors.attributes');
    }
    if (!isValid) {
        for (let i = 0; i < errorKeys.length; i++) {
            showErrorMessage(t(errorKeys[i]));
        }
    } else {
        let p = {};
        if (accessPolicyDetails.value.id === undefined || accessPolicyDetails.value.id === null) {
            p.id = (props.policyData?.length + 1).toString();
        } else {
            p.id = accessPolicyDetails.value.id;
        }

        p.title = accessPolicyDetails.value.title;
        p.description = accessPolicyDetails.value.description;
        p.scopes = scopes;
        p.groups = groups;
        p.countries = countries;
        p.sizes = sizes;
        p.domains = domains;
        if (accessPolicyDetails.value.id === undefined || accessPolicyDetails.value.id === null) {
            props.policyData.push(p);
        } else {
            props.policyData[p.id - 1] = p;
        }

        //const updatedPolicyData = [...props.policyData, p];
        //props.policyData = updatedPolicyData;
        emit('update:policy-data', props.policyData);
        console.log(props.policyData);
        switchPolicyForm.value = false;
        console.log(policiesCount.value);
        page.value = props.policyData.length / pageCount;
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
                <div v-if="props.policyData.length > pageCount" class="flex justify-end mt-2">
                    <UPagination v-model="page" :page-count="pageCount" :total="props.policyData.length" />
                </div>

                <UButton @click="handleNewPolicyClick()">{{ $t('policies.actions.add') }}</UButton>
            </UCard>
            <div class="w-full flex items-center justify-between mt-4">
                <UButton size="lg" color="gray" variant="outline" @click="emit('changePage', 1)">
                    {{ $t('back') }}
                </UButton>
                <UButton size="md" type="submit">{{ $t('next') }} </UButton>
            </div>
        </UForm>
    </Transition>
    <!-- Modal -->
    <UModal v-model="switchPolicyForm" class="flex flex-grow">
        <UCard class="flex flex-col text-gray-700">
            <div class="flex items-start gap-8">
                <h2 class="text-lg font-medium">Asset details</h2>
            </div>

            <div class="flex items-start gap-8">
                <div class="flex gap-2 flex-col w-1/4">ID</div>
                <div class="flex gap-2 flex-col w-3/4 font-light font-mono">
                    {{ props.selected.id }}
                </div>
            </div>

            <div class="flex items-start gap-8">
                <div class="flex gap-2 flex-col w-1/4">Title</div>
                <div class="flex gap-2 flex-col w-3/4 font-bold">
                    {{ props.selected.title }}
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <h2 class="text-lg font-medium">Policy definition details</h2>
            </div>

            <input v-model="accessPolicyDetails.id" type="hidden" />
            <div class="flex items-start gap-8">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        v-model="accessPolicyDetails.title"
                        type="text"
                        class="mt-1 block border-gray-300 rounded-md shadow-sm"
                    />
                </div>
            </div>
            <div class="flex items-start gap-8">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        v-model="accessPolicyDetails.description"
                        type="textarea"
                        class="mt-1 block border-gray-300 rounded-md shadow-sm"
                    />
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700">Scopes</label>
                </div>
                <div class="flex flex-row w-full">
                    <div class="flex gap-2 flex-col w-1/3">
                        <label class="inline-flex items-center">
                            <input v-model="checkedScopes[0]" type="checkbox" name="scopes[]" class="form-checkbox" />
                            <span class="ml-2">READ</span>
                        </label>
                    </div>
                    <div class="flex gap-2 flex-col w-1/3">
                        <label class="inline-flex items-center">
                            <input v-model="checkedScopes[1]" type="checkbox" name="scopes[]" class="form-checkbox" />
                            <span class="ml-2">TRADE</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Organizations</label>
                    <small class="mb-2">Select organization(s) to exclude for the selected scope(s)</small>
                    <div class="flex flex-row flex-wrap mb-2 gap-4">
                        <label
                            v-for="(group, index) in allGroups"
                            :key="group.id"
                            class="inline-flex items-center w-1/6"
                        >
                            <input
                                v-model="checkedGroups[index]"
                                type="checkbox"
                                name="groups[]"
                                class="form-checkbox"
                            />
                            <span class="ml-2">{{ group.name }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Domains</label>
                    <small class="mb-2">Select domain(s) of organizations to exclude for the selected scope(s)</small>
                    <div class="flex flex-row flex-wrap mb-2 gap-4">
                        <label
                            v-for="(attr, index) in allDomains"
                            :key="attr.code"
                            class="inline-flex items-center w-1/6"
                        >
                            <input
                                v-model="checkedDomains[index]"
                                type="checkbox"
                                name="domains[]"
                                class="form-checkbox"
                            />
                            <span class="ml-2">{{ attr.title }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Countries</label>
                    <small class="mb-2"
                        >Select country(ies) of organizations to exclude for the selected scope(s)</small
                    >
                    <div class="flex flex-row flex-wrap mb-2 gap-4">
                        <label
                            v-for="(attr, index) in allCountries"
                            :key="attr.code"
                            class="inline-flex items-center w-1/6"
                        >
                            <input
                                v-model="checkedCountries[index]"
                                type="checkbox"
                                name="countries[]"
                                class="form-checkbox"
                            />
                            <span class="ml-2">{{ attr.title }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="flex items-start gap-8 mt-6">
                <div class="flex flex-col w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <small class="mb-2">Select size(s) of organizations to exclude for the selected scope(s)</small>
                    <div class="flex flex-row flex-wrap mb-2 gap-4">
                        <label
                            v-for="(attr, index) in allSizes"
                            :key="attr.code"
                            class="inline-flex items-center w-1/6"
                        >
                            <input
                                v-model="checkedSizes[index]"
                                type="checkbox"
                                name="sizes[]"
                                class="form-checkbox"
                            />
                            <span class="ml-2">{{ attr.title }}</span>
                        </label>
                    </div>
                </div>
            </div>

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
