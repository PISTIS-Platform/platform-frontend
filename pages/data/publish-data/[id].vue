<script setup lang="ts">
import { v4 as uuidV4 } from 'uuid';
import { z } from 'zod';

import { DatasetKind } from '~/interfaces/dataset.enum';
import { DownloadFrequency } from '~/interfaces/download-frequency.enum';
import type { AccessPolicyDetails, AssetOfferingDetails } from '~/interfaces/plan-designer';

const runtimeConfig = useRuntimeConfig();

const { data: session } = useAuth();
// const { showSuccessMessage } = useAlertMessage();
const router = useRouter();
const { t } = useI18n();
const submitError = ref(false);
const submitSuccess = ref(false);
const route = useRoute();
const assetId = route.params.id;

//TODO: Get ID and data to pass down to DatasetSelector from API call
const selected = ref<
    { id: string | number; title: string; description: string; distributions: Record<string, any>[] } | undefined
>(undefined);

const { data: dataset, status: datasetsStatus } = useAsyncData<Record<string, any>>(() =>
    $fetch('/api/datasets/get-specific', { query: { id: assetId } }),
);
watch(dataset, () => {
    if (!dataset.value) return;
    selected.value = {
        id: dataset?.value.id,
        title: dataset.value.title.en || 'N/A',
        description: dataset.value.description.en || 'N/A',
        distributions: dataset.value.distributions,
    };
    assetOfferingDetails.value.title = selected.value.title;
    assetOfferingDetails.value.description = selected.value.description;
    assetOfferingDetails.value.distributions = selected?.value.distributions?.map((item) => ({
        ...item,
        label: `${item?.title?.en ?? t('data.designer.noTitle')} (${item?.format?.label ?? t('data.designer.unknownFormat')})`,
    }));
    assetOfferingDetails.value.selectedDistribution = assetOfferingDetails.value.distributions[0];
});

//data for selection whole dataset or query

const completeOrQuery = ref<string>(DatasetKind.COMPLETE);
const newAssetId = uuidV4();

// FAIR data valuation suggestions data
//TODO: Will probably receive data from the component with its own API call

const fairValuationInfo = ref<{
    overallRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    dataQuality: number;
    technical: number;
    business: number;
    legal: number;
    privacy: number;
}>({
    overallRating: 'A',
    dataQuality: 28,
    technical: 20,
    business: 32,
    legal: 13,
    privacy: 30,
});

const loadingValuation = ref(false);

// data for asset offering details

const assetOfferingDetails = ref<AssetOfferingDetails>({
    title: '',
    description: '',
    distributions: [{}],
    selectedDistribution: {},
    keywords: [],
});

const assetOfferingDetailsSchema = z.object({
    title: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    description: z.string().min(5, t('val.atLeastNumberChars', { count: 5 })),
    selectedDistribution: z.object({
        id: z.string(),
        format: z.object({
            id: z.string(),
            label: z.string(),
            resource: z.string(),
        }),
        access_url: z.array(z.string()),
        title: z.object({
            en: z.string(),
        }),
    }),
});

const isAssetOfferingDetailsValid = computed(() => {
    return (
        assetOfferingDetailsSchema.safeParse(assetOfferingDetails.value).success &&
        assetOfferingDetails?.value.keywords.length > 0
    );
});

// data for monetization selections

const { isFree, monetizationSchema } = useMonetizationSchema();

type monetizationType = z.infer<typeof monetizationSchema>;

const monetizationDetails = ref<Partial<monetizationType>>({
    type: 'one-off',
    price: 0,
});

type licenseType = z.infer<typeof licenseSchema>;

const licenseDetails = ref<Partial<licenseType>>({
    license: 'PISTIS License',
    extraTerms: '',
    contractTerms: '',
    limitNumber: 0,
    limitFrequency: '',
    isExclusive: false,
    region: '',
    transferable: '',
    termDate: '',
    additionalRenewalTerms: '',
    nonRenewalDays: 0,
    contractBreachDays: 0,
    personalDataTerms: '',
});

const { isWorldwide, isPerpetual, hasPersonalData, licenseSchema } = useLicenseSchema();

// access policies
const policyData: Array<AccessPolicyDetails> = [];
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

const submitAll = async () => {
    submitStatus.value = 'pending';
    let body = {
        originalAssetId: selected.value?.id,
        organizationId: runtimeConfig.public?.orgId,
        organizationName: session.value?.orgName,
        ...assetOfferingDetails.value,
        ...monetizationDetails.value,
        termDate: monetizationDetails.value.termDate ?? new Date(86400000000000),
        distributionId: assetOfferingDetails.value.selectedDistribution.id,
        assetId: newAssetId,
        containsPersonalData: hasPersonalData.value,
        accessPolicies: {
            assetId: newAssetId,
            assetTitle: assetOfferingDetails.value.title,
            assetDescription: assetOfferingDetails.value.description,
            policyData: policyData,
        },
        sellerId: session.value?.user?.sub,
        numOfResell: 0,
        numOfShare: 0,
    };
    delete body.distributions;
    delete body.selectedDistribution;

    try {
        await $fetch(`/api/datasets/publish-data`, {
            method: 'post',
            body,
        });
        submitStatus.value = 'success';
        await delay(3);
        await navigateTo(`https://pistis-market.eu/srv/catalog/datasets/${newAssetId}`, {
            open: {
                target: '_blank',
            },
            // external: true,
        });
        submitStatus.value = '';
        router.push({ name: 'home' });
    } catch (error) {
        submitStatus.value = 'error';
    }

    return body;
};

const limitFrequencySelections = computed(() => [
    { title: t('perHour'), value: DownloadFrequency.HOUR },
    { title: t('perDay'), value: DownloadFrequency.DAY },
    { title: t('perWeek'), value: DownloadFrequency.WEEK },
    { title: t('perMonth'), value: DownloadFrequency.MONTH },
    { title: t('perYear'), value: DownloadFrequency.YEAR },
]);

const steps = computed(() => [
    { name: t('data.designer.nav.selectDataset'), isActive: selected.value },
    { name: t('data.designer.nav.monetizationPlanner'), isActive: selected.value && isAssetOfferingDetailsValid.value },
    { name: t('data.designer.nav.licenseSelector'), isActive: true },
    { name: t('data.designer.nav.accessPoliciesEditor'), isActive: selected.value && isAllValid.value },
    { name: t('data.designer.nav.preview'), isActive: selected.value && isAllValid.value },
]);

const isAllValid = ref(false);

const selectedPage = ref(0);

const handlePageSelectionBackwards = (value: number) => {
    selectedPage.value = value;
    submitError.value = false;
    submitSuccess.value = false;
};

const changeStep = async (stepNum: number) => {
    selectedPage.value = stepNum;
    if (stepNum === 4) {
        //api call to contract template composer
        //FIXME: Currently getting a 404 for API which this fetch calls
        const _data = await $fetch(`/api/datasets/get-composed-contract`, {
            method: 'post',
            body: {
                assetId: newAssetId,
                organizationId: runtimeConfig.public?.orgId,
                terms: licenseDetails.value.contractTerms,
                monetisationMethod: monetizationDetails.value.type,
                price: monetizationDetails.value.price,
                limitNumber: licenseDetails.value.limitNumber,
                limitFrequency: licenseDetails.value.limitFrequency,
                subscriptionFrequency:
                    monetizationDetails.value.type === 'subscription'
                        ? monetizationDetails.value.subscriptionFrequency
                        : null,
            },
        });
        //TODO:: use returned compose contract for other pistis components
    }
};
</script>

<template>
    <NavigationSteps :steps="steps" :selected-page="selectedPage" @select-page="changeStep" />

    <UProgress v-if="datasetsStatus === 'pending'" animation="carousel" />

    <div v-show="selectedPage === 0" class="w-full h-full text-gray-700 space-y-8">
        <DatasetSelector
            v-if="selected"
            :selected="selected"
            :complete-or-query="completeOrQuery"
            @update:complete-or-query="(value: string) => (completeOrQuery = value)"
        />

        <AssetOfferingDetails
            v-model:asset-details-prop="assetOfferingDetails"
            @update:asset-keywords="(value: string[]) => (assetOfferingDetails.keywords = value)"
            @change-page="changeStep"
        />
    </div>

    <div v-show="selectedPage === 1" class="w-full h-full text-gray-700 space-y-8">
        <FairSuggestions v-model="fairValuationInfo" :loading-valuation="loadingValuation" />

        <MonetizationMethod
            v-model:monetization-details-prop="monetizationDetails"
            :asset-offering-details="assetOfferingDetails"
            @change-page="changeStep"
            @update:is-free="(value: boolean) => (isFree = value)"
            @update:is-worldwide="(value: boolean) => (isWorldwide = value)"
            @update:is-perpetual="(value: boolean) => (isPerpetual = value)"
            @update:has-personal-data="(value: boolean) => (hasPersonalData = value)"
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
            @update:is-perpetual="(value: boolean) => (isPerpetual = value)"
            @update:has-personal-data="(value: boolean) => (hasPersonalData = value)"
        />
    </div>

    <template v-if="selected">
        <div v-show="selectedPage === 3" class="w-full h-full text-gray-700 space-y-8">
            <AccessPolicyList
                v-model:policy-data="policyData"
                :selected="selected"
                @change-page="changeStep"
                @update:policy-data="(value: AccessPolicyDetails[]) => (policyData = value)"
            />
        </div>
    </template>

    <Preview
        v-if="selectedPage === 4"
        :monetization-details="monetizationDetails"
        :asset-offering-details="assetOfferingDetails"
        :license-details="licenseDetails"
        :limit-frequency-selections="limitFrequencySelections"
        :is-perpetual="isPerpetual"
        :is-worldwide="isWorldwide"
        :has-personal-data="hasPersonalData"
        :submit-status="submitStatus"
        @handle-page-selection-backwards="handlePageSelectionBackwards"
        @submit-all="submitAll"
    />
</template>
