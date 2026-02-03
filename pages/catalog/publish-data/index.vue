<script setup lang="ts">
import * as R from 'ramda';
import { v4 as uuidV4 } from 'uuid';
import { z } from 'zod';

import { LicenseCode } from '~/constants/licenses';
import { DatasetKind } from '~/interfaces/dataset.enum';
import type { AccessPolicyDetails, AssetOfferingDetails } from '~/interfaces/plan-designer';

const runtimeConfig = useRuntimeConfig();

const { data: accountData } = await useFetch<Record<string, any>>(`/api/account/get-account-details`, {
    query: { page: '' },
});

const route = useRoute();
const { t } = useI18n();
const submitError = ref(false);
const submitSuccess = ref(false);

// Refs for Child Components
const datasetSelectorRef = ref();
const assetOfferingRef = ref();

const dataSelectorIsValid = ref(false);

const triggerDatasetSelectorValidation = () => {
    if (datasetSelectorRef.value) {
        datasetSelectorRef.value.triggerValidation();
    }
};

const triggerAssetOfferingValidation = () => {
    if (assetOfferingRef.value) {
        assetOfferingRef.value.triggerValidation();
    }
};

const pendingAssetDetails = ref<AssetOfferingDetails | null>(null);

const handleAssetDetailsUpdate = (newDetails: AssetOfferingDetails) => {
    const oldDist = assetOfferingDetails.value.selectedDistribution;
    const newDist = newDetails.selectedDistribution;

    // Check if the Distribution specifically has changed
    const hasDistributionChanged = oldDist?.id !== newDist?.id;

    // LOGIC: If Distribution changed + We are in Query Mode + New Dist is NOT SQL
    if (hasDistributionChanged && completeOrQuery.value === DatasetKind.QUERY_FILTER && newDist?.format?.id !== 'SQL') {
        // 1. Store the intended change, but don't apply it yet
        pendingAssetDetails.value = newDetails;
        // 2. Open the warning modal in the child
        datasetSelectorRef.value?.openSwitchWarning();
    } else {
        // Safe change: Apply immediately
        assetOfferingDetails.value = newDetails;
    }
};

const selectedAsset = ref<
    | { id: string | number; title: string; description: string; distributions: Record<string, any>[]; keywords: any[] }
    | undefined
>(undefined);

const hasRouteAssetId = computed(() => !!route.query.id);

const {
    data: datasetsData,
    status: datasetsStatus,
    refresh,
} = useAsyncData<Record<string, any>[]>(() => $fetch('/api/datasets/get-all'), { immediate: !hasRouteAssetId.value });

const { data: dataset, status: singleDatasetStatus } = useFetch<Record<string, any>>(`/api/datasets/get-specific`, {
    immediate: hasRouteAssetId.value,
    query: { id: route.query.id },
    onResponse({ response }) {
        if (R.isNil(response._data)) {
            refresh();
        } else {
            selectedAsset.value = transformSingleDataset(response._data);
        }
    },
});

const sortByDateDesc = R.sortWith([R.descend(R.prop('modified'))]);

const transformedDatasets = computed(() => {
    if (!datasetsData.value || !datasetsData.value.length) {
        return [];
    }
    return sortByDateDesc(
        datasetsData.value.map((dataset: Record<string, any>) => ({
            id: dataset.id,
            title: dataset.title.en,
            description: dataset.description.en,
            distributions: dataset.distributions,
            modified: dataset.modified,
            keywords: dataset.keywords?.map((keyword: any) => keyword.id),
        })),
    );
});

const transformSingleDataset = (dataset: Record<string, any>) => ({
    id: dataset.id,
    title: dataset.title.en,
    description: dataset.description.en,
    distributions: dataset.distributions,
    keywords: dataset.keywords?.map((keyword: any) => keyword.id),
});

const { data: isAssetOnMarketplace } = useAsyncData(
    () =>
        $fetch(`/api/datasets/is-on-marketplace`, {
            query: {
                id: selectedAsset.value?.id,
            },
        }),
    {
        watch: [selectedAsset],
        immediate: !!selectedAsset.value,
    },
);

watch(selectedAsset, () => {
    if (!selectedAsset.value) return;
    assetOfferingDetails.value.title = selectedAsset.value.title;
    assetOfferingDetails.value.description = selectedAsset.value.description;
    assetOfferingDetails.value.distributions = selectedAsset?.value.distributions?.map((item) => ({
        ...item,
        label: `${item?.title?.en ?? t('data.designer.noTitle')} (${item?.format?.label ?? t('data.designer.unknownFormat')})`,
    }));
    assetOfferingDetails.value.selectedDistribution = assetOfferingDetails.value.distributions[0];
    assetOfferingDetails.value.keywords = selectedAsset.value.keywords || [];
});

//data for selection whole dataset or query

const completeOrQuery = ref<string>(DatasetKind.COMPLETE);
const resetCompleteOrQuery = () => {
    completeOrQuery.value = DatasetKind.COMPLETE;

    if (datasetSelectorRef.value) {
        datasetSelectorRef.value.clearForms();
    }

    if (pendingAssetDetails.value) {
        assetOfferingDetails.value = pendingAssetDetails.value;
        pendingAssetDetails.value = null;
    }
};

const handleResetCancel = () => {
    pendingAssetDetails.value = null;
};
const newAssetId = uuidV4();

// data for asset offering details

const assetOfferingDetails = ref<AssetOfferingDetails>({
    title: '',
    description: '',
    distributions: [{}],
    selectedDistribution: {},
    keywords: [],
});

const assetOfferingDetailsSchema = z.object({
    title: z.string().min(1, t('required', { count: 1 })),
    description: z.string().min(1, t('required', { count: 1 })),
    selectedDistribution: z.object({
        label: z.string(),
        id: z.string(),
        format: z
            .object({
                id: z.string(),
                label: z.string().optional(),
                resource: z.string().optional(),
            })
            .optional(),
        access_url: z.array(z.string()).optional(),
        title: z.object({
            en: z.string(),
        }),
    }),
});

const isAssetOfferingDetailsValid = computed(() => {
    return (
        assetOfferingDetailsSchema.safeParse(assetOfferingDetails.value).success &&
        assetOfferingDetails?.value.keywords?.length > 0
    );
});

// data for monetization selections

const { isFree, monetizationSchema } = useMonetizationSchema();

type monetizationType = z.infer<typeof monetizationSchema>;

const monetizationDetails = ref<Partial<monetizationType>>({
    type: 'one-off',
    price: '',
});

const isMonetizationValid = computed(() => {
    return monetizationSchema.safeParse(monetizationDetails.value).success;
});

const isLicenseValid = computed(() => {
    return licenseSchema.safeParse(licenseDetails.value).success;
});
type licenseType = z.infer<typeof licenseSchema>;

const licenseDetails = ref<Partial<licenseType>>({
    license: '',
    extraTerms: '',
    contractTerms: '',
    isExclusive: false,
    region: '',
    duration: '',
    perpetual: '',
    transferable: 'non-transferable',
    additionalRenewalTerms: '',
    nonRenewalDays: '',
    contractBreachDays: '',
    personalDataTerms: '',
    noUseWithBlacklistedDatasets: false,
    numOfResell: undefined,
    numOfShare: undefined,
    canEdit: false,
});

const { isWorldwide, hasPersonalData, licenseSchema } = useLicenseSchema(monetizationDetails);

// access policies
let policyData: Array<AccessPolicyDetails> = [];
const defaultPolicy: AccessPolicyDetails = {
    countries: [],
    domains: [],
    groups: [],
    scopes: [],
    sizes: [],
    types: [],
    id: t('policies.publicationDefaults.id'),
    title: t('policies.publicationDefaults.title'),
    description: t('policies.publicationDefaults.description'),
    default: true,
};
policyData.push(defaultPolicy);

const submitStatus = ref();

const bodyToSend = computed(() => {
    if (monetizationDetails.value.type === 'nft') {
        return {
            type: 'nft',
            assetId: selectedAsset.value?.id,
            organizationId: runtimeConfig.public?.orgId,
            organizationName: accountData.value?.user.orgName,
            price: monetizationDetails.value.price,
            title: assetOfferingDetails.value.title,
            description: assetOfferingDetails.value.description,
            license: licenseDetails.value.license,
            contractTerms: licenseDetails.value.contractTerms,
            accessPolicies: {
                assetId: selectedAsset.value?.id,
                assetTitle: assetOfferingDetails.value.title,
                assetDescription: assetOfferingDetails.value.description,
                policyData: policyData,
            },
            sellerId: accountData.value?.user.sub,
        };
    } else if (licenseDetails.value.license === LicenseCode.PISTIS) {
        return {
            assetId: newAssetId,
            originalAssetId: selectedAsset.value?.id,
            organizationId: runtimeConfig.public?.orgId,
            organizationName: accountData.value?.user.orgName,
            ...monetizationDetails.value,
            distributionId: assetOfferingDetails.value.selectedDistribution.id,
            title: assetOfferingDetails.value.title,
            description: assetOfferingDetails.value.description,
            keywords: assetOfferingDetails.value.keywords,
            type: monetizationDetails.value.type,
            subscriptionFrequency: monetizationDetails.value.subscriptionFrequency,
            updateFrequency: monetizationDetails.value.updateFrequency,
            price: monetizationDetails.value.price,
            license: licenseDetails.value.license,
            extraTerms: licenseDetails.value.extraTerms,
            contractTerms: licenseDetails.value.contractTerms,
            canEdit: false,
            region: licenseDetails.value?.region ? licenseDetails.value?.region?.join(', ') : '',
            isExclusive: licenseDetails.value.isExclusive,
            transferable: licenseDetails.value.transferable,
            duration: typeof licenseDetails.value.duration === 'number' ? licenseDetails.value.duration : null,
            perpetual: typeof licenseDetails.value.duration === 'string' ? licenseDetails.value.duration : null,
            noUseWithBlacklistedDatasets: licenseDetails.value.noUseWithBlacklistedDatasets,
            additionalRenewalTerms: licenseDetails.value.additionalRenewalTerms,
            nonRenewalDays: licenseDetails.value.nonRenewalDays,
            contractBreachDays: licenseDetails.value.contractBreachDays,
            containsPersonalData: hasPersonalData.value,
            personalDataTerms: licenseDetails.value.personalDataTerms,
            accessPolicies: {
                assetId: newAssetId,
                assetTitle: assetOfferingDetails.value.title,
                assetDescription: assetOfferingDetails.value.description,
                policyData: policyData,
            },
            sellerId: accountData.value?.user.sub,
            numOfResell: licenseDetails.value.numOfResell,
            numOfShare: licenseDetails.value.numOfShare,
        };
    }

    return {
        assetId: newAssetId,
        originalAssetId: selectedAsset.value?.id,
        organizationId: runtimeConfig.public?.orgId,
        organizationName: accountData.value?.user.orgName,
        ...monetizationDetails.value,
        distributionId: assetOfferingDetails.value.selectedDistribution.id,
        title: assetOfferingDetails.value.title,
        description: assetOfferingDetails.value.description,
        keywords: assetOfferingDetails.value.keywords,
        type: monetizationDetails.value.type,
        subscriptionFrequency: monetizationDetails.value.subscriptionFrequency,
        updateFrequency: monetizationDetails.value.updateFrequency,
        price: monetizationDetails.value.price,
        license: licenseDetails.value.license,
        contractTerms: licenseDetails.value.contractTerms,
        accessPolicies: {
            assetId: newAssetId,
            assetTitle: assetOfferingDetails.value.title,
            assetDescription: assetOfferingDetails.value.description,
            policyData: policyData,
        },
        sellerId: accountData.value?.user.sub,
        numOfResell: licenseDetails.value.numOfResell,
        numOfShare: licenseDetails.value.numOfShare,
        canEdit: licenseDetails.value.canEdit,
    };
});

const submitAll = async () => {
    submitStatus.value = 'pending';
    const body = bodyToSend.value;

    const assetId = monetizationDetails.value.type === 'nft' ? selectedAsset.value?.id : newAssetId;

    try {
        await $fetch(`/api/datasets/publish-data`, {
            method: 'post',
            body,
        });
        submitStatus.value = 'success';
        await delay(3);
        submitStatus.value = '';
        await navigateTo(`/marketplace/dataset-details/${assetId}?pm=cloud`);
    } catch (error) {
        submitStatus.value = 'error';
    }

    return body;
};

const steps = computed(() => [
    { name: t('data.designer.nav.selectDataset'), isActive: selectedAsset.value },
    {
        name: t('data.designer.nav.monetizationPlanner'),
        isActive: selectedAsset.value,
    },
    {
        name: t('data.designer.nav.licenseSelector'),
        isActive: selectedAsset.value && isAssetOfferingDetailsValid.value && isMonetizationValid.value,
    },
    {
        name: t('data.designer.nav.accessPoliciesEditor'),
        isActive:
            selectedAsset.value &&
            isAssetOfferingDetailsValid.value &&
            isMonetizationValid.value &&
            isLicenseValid.value,
    },
    {
        name: t('data.designer.nav.preview'),
        isActive:
            selectedAsset.value &&
            isAssetOfferingDetailsValid.value &&
            isMonetizationValid.value &&
            isLicenseValid.value,
    },
]);

const selectedPage = ref(0);

const handlePageSelectionBackwards = (value: number) => {
    selectedPage.value = value;
    submitError.value = false;
    submitSuccess.value = false;
};

const changeStep = async (stepNum: number) => {
    selectedPage.value = stepNum;
};
</script>

<template>
    <NavigationSteps :steps="steps" :selected-page="selectedPage" @select-page="changeStep" />
    <UProgress v-if="datasetsStatus === 'pending' || singleDatasetStatus === 'pending'" animation="carousel" />

    <div
        v-show="selectedPage === 0 && datasetsStatus !== 'pending' && singleDatasetStatus !== 'pending'"
        class="w-full h-full text-gray-700 space-y-8"
    >
        <UAlert
            v-if="hasRouteAssetId && !dataset && !selectedAsset"
            :title="t('data.designer.error.noAssetFound')"
            color="red"
            variant="subtle"
            icon="nonicons:not-found-16"
        />
        <UAlert
            v-if="(!datasetsData || !datasetsData.length) && !hasRouteAssetId"
            :title="t('data.designer.error.noAssetsFound')"
            color="yellow"
            variant="subtle"
            icon="nonicons:not-found-16"
        />
        <UCard>
            <template #header>
                <div class="flex items-start justify-between w-full">
                    <div class="flex items-center gap-4">
                        <UIcon name="oui:pages-select" class="w-10 h-10 text-gray-500" />
                        <SubHeading
                            :title="$t('data.investmentPlanner.datasetSelectorTitle')"
                            :info="$t('data.investmentPlanner.datasetSelectorInfo')"
                        />
                    </div>
                    <div v-if="hasRouteAssetId">
                        <UButton variant="outline" @click="refresh">{{ $t('data.designer.getAllMyDatasets') }}</UButton>
                    </div>
                </div>
            </template>
            <USelectMenu
                v-model="selectedAsset"
                searchable
                :search-attributes="['title', 'description']"
                :options="transformedDatasets"
                option-attribute="title"
                :placeholder="$t('data.investmentPlanner.datasetSelectorPlaceholder')"
            >
                <template #option="{ option: dataset }">
                    <div class="flex flex-col gap-0.5">
                        <span class="font-semibold">{{ dataset.title }}</span>
                        <span class="text-gray-500 text-sm line-clamp-1">{{ dataset.description }}</span>
                    </div>
                </template>
            </USelectMenu>
        </UCard>

        <div>
            <div class="w-full flex items-center justify-end gap-4">
                <UButton v-if="selectedAsset" size="md" type="submit" @click="changeStep(1)">{{ $t('next') }} </UButton>
            </div>
        </div>
    </div>

    <div v-show="selectedPage === 1" class="w-full h-full text-gray-700 space-y-8">
        <AssetOfferingDetails
            v-if="selectedAsset"
            ref="assetOfferingRef"
            :asset-details-prop="assetOfferingDetails"
            :selected-asset="selectedAsset"
            :monetization-details="monetizationDetails"
            @update:asset-details-prop="handleAssetDetailsUpdate"
            @update:asset-keywords="(value: string[]) => (assetOfferingDetails.keywords = value)"
            @change-page="changeStep"
        />
        <DatasetSelector
            v-if="selectedAsset"
            ref="datasetSelectorRef"
            :selected="selectedAsset"
            :asset-offering-details="assetOfferingDetails"
            :monetization-details="monetizationDetails"
            :complete-or-query="completeOrQuery"
            @update:complete-or-query="(value: string) => (completeOrQuery = value)"
            @reset="resetCompleteOrQuery"
            @cancel="handleResetCancel"
            @update:data-selector-is-valid="(val) => (dataSelectorIsValid = val)"
        />

        <MonetizationMethod
            v-model:monetization-details-prop="monetizationDetails"
            :asset-offering-details="assetOfferingDetails"
            :asset-on-marketplace="isAssetOnMarketplace"
            :data-selector-is-valid="dataSelectorIsValid"
            :complete-or-query="completeOrQuery"
            @change-page="changeStep"
            @update:is-free="(value: boolean) => (isFree = value)"
            @update:is-worldwide="(value: boolean) => (isWorldwide = value)"
            @update:has-personal-data="(value: boolean) => (hasPersonalData = value)"
            @trigger-external-validation="triggerDatasetSelectorValidation"
            @trigger-asset-validation="triggerAssetOfferingValidation"
            @reset-dataset-selector="resetCompleteOrQuery"
        />
    </div>

    <div v-show="selectedPage === 2" class="w-full h-full text-gray-700 space-y-8">
        <LicenseSelector
            v-model:license-details-prop="licenseDetails"
            :monetization-details="monetizationDetails"
            :asset-offering-details="assetOfferingDetails"
            :is-free="isFree"
            @change-page="changeStep"
            @update:is-worldwide="(value: boolean) => (isWorldwide = value)"
            @update:has-personal-data="(value: boolean) => (hasPersonalData = value)"
        />
    </div>

    <template v-if="selectedAsset">
        <div v-show="selectedPage === 3" class="w-full h-full text-gray-700 space-y-8">
            <AccessPolicyList
                v-model:policy-data="policyData"
                :selected="selectedAsset"
                @change-page="changeStep"
                @update:policy-data="(value: AccessPolicyDetails[]) => (policyData = value)"
            />
        </div>
    </template>

    <Preview
        v-if="selectedPage === 4"
        :body-to-send="bodyToSend"
        :policy-data="policyData"
        :monetization-details="monetizationDetails"
        :asset-offering-details="assetOfferingDetails"
        :license-details="licenseDetails"
        :is-worldwide="isWorldwide"
        :has-personal-data="hasPersonalData"
        :submit-status="submitStatus"
        @handle-page-selection-backwards="handlePageSelectionBackwards"
        @submit-all="submitAll"
    />
</template>
