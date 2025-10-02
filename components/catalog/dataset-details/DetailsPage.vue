<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import 'vue-sonner/style.css';

import axios from 'axios';
import { toast } from 'vue-sonner';

import { useDataTruncator } from '@/composables/useDataTruncator';
import PhCaretLeft from '~icons/ph/caret-left';

// import MatchmakingServiceView from '../matchmaking-service/MatchmakingServiceView.vue';
// import MonetizationView from '../monetization/MonetizationView.vue';

const config = useRuntimeConfig();

const props = withDefaults(
    defineProps<{
        headline?: string;
        title?: string;
        subtitle?: string;
        datasetId: string;
        summary?: { title: string; text: string }[];
        descriptionMarkup?: string;
    }>(),
    {
        headline: 'Dataset',
    },
);

const router = useRouter();
const route = useRoute();
const pistisMode = route.query.pm;

const { data: session } = useAuth();

const token = ref(session.value?.token);

let url = '';

if (pistisMode === 'factory') {
    url = config.public.factoryUrl;
} else {
    url = config.public.cloudUrl;
}
const searchUrl = url + '/srv/search/';

const userFactoryUrl = config.public.cloudUrl + '/srv/factories-registry/api/factories/user-factory';
const distributionID = ref(null);
const accessID = ref('');
const backendUrl = ref('');
const metadata = ref(null);
const organizationId = ref(null);
const catalog = ref(null);
const factoryPrefix = ref('');
const price = ref('');
const isOwned = computed(() => {
    // True only in datasets that the logged-in user owns
    return organizationId.value === monetizationData.value?.publisher?.organization_id;
});
const monetizationData = ref();
const offerId = ref('');
const feedbackUrl = computed(() => `/marketplace/usage-analytics/${props.datasetId}/questionnaire`);

const setDistributionID = async (data) => {
    distributionID.value = data['result']['distributions'][0].id;
};

const setAccessID = async (data) => {
    try {
        let accessIDFound = false;
        for (const distribution of data['result']['distributions']) {
            if (distribution['access_url'] && distribution['access_url'][0]) {
                const url = new URL(distribution['access_url'][0]);
                // const parts = distribution['access_url'][0].split('asset_uuid=');
                // accessID.value = parts[parts.length - 1];
                const parts = url.searchParams.get('asset_uuid');
                accessID.value = parts;

                backendUrl.value = url.hostname;

                accessIDFound = true;
                break;
            }
        }

        if (!accessIDFound) {
            console.log('No access_url found in distributions.');
        }
    } catch (error) {
        console.error('Error fetching access ID:', error);
    }
};

const hasInvestmentOffer = computed(() => monetizationData.value?.investment_offer?.some((offer) => offer?.is_active));

const hasPurchaseOffer = computed(() => monetizationData.value?.purchase_offer);

const offerType = computed(() => {
    const hasInvestment = hasInvestmentOffer.value;
    const hasPurchase = hasPurchaseOffer.value;

    if (hasInvestment && hasPurchase) return 'both';
    if (hasInvestment) return 'investment';
    if (hasPurchase) return 'purchase';
    return 'none';
});

const fetchMetadata = async () => {
    try {
        const response = await fetch(`${searchUrl}datasets/${props.datasetId}`);
        const data = await response.json();
        metadata.value = data;
        catalog.value = data.result.catalog.id;
        console.log(metadata.value);
        if (pistisMode == 'cloud') {
            // const purchaseOffer = metadata.value.result.monetization[0].purchase_offer;
            // console.log('preis:' + purchaseOffer.price);
            monetizationData.value = metadata.value.result.monetization[0];

            price.value = monetizationData.value?.purchase_offer[0].price;
            offerId.value = props.datasetId;
        }
        if (pistisMode == 'factory') {
            offerId.value = metadata.value.result?.offer?.marketplace_offer_id;
        }

        setAccessID(data);
        setDistributionID(data);
    } catch (error) {
        console.error('Error fetching the metadata. ERROR: ', error);
    }
};

const getUserFactory = async () => {
    try {
        const response = await fetch(`${userFactoryUrl}`, {
            headers: {
                Authorization: `Bearer ${token.value}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        organizationId.value = data.organizationId;
        factoryPrefix.value = data.factoryPrefix;
    } catch (error) {
        console.error('Error getting data:', error);
    }
};

const buyRequest = async () => {
    const offer = monetizationData.value?.purchase_offer?.[0] || {};
    const seller = metadata.value.result?.monetization?.[0] || {};
    const title = Object.values(metadata.value.result?.title ?? {})[0] ?? '';

    const url = `https://${factoryPrefix.value}.${config.public.cloudUrl.replace(/^https?:\/\//, '')}/srv/smart-contract-execution-engine/api/scee/storePurchase`;
    console.log('url', url);
    console.log('url', url);
    const promise = axios.post(
        url,
        {
            assetId: props.datasetId,
            assetFactory: offer.publisher?.organization_id ?? '',
            sellerId: seller.seller_id ?? '',
            price: offer.price ?? 0,
        },
        {
            headers: {
                Authorization: `Bearer ${token.value}`,
                'Content-Type': 'application/json',
            },
        },
    );

    toast.promise(promise, {
        loading: 'Processing your purchase...',
        success: () => `Successfully purchased ${title}`,
        error: (err) => err?.response?.data?.reason || 'An error occurred while processing your request.',
    });

    try {
        const res = await promise;
        console.log('Purchase complete', res.data);
    } catch (err) {
        console.error('Purchase failed', err);
    }
};

onMounted(() => {
    fetchMetadata();
    getUserFactory();
});

// Dataset desecription truncator "show more"
const { data: truncatedDescription, isTruncated: isDescriptionTruncated } = useDataTruncator({
    data: computed(() => props.descriptionMarkup || ''),
    limit: 550,
});

const _truncatedEllipsedDescription = computed(() => {
    if (toValue(isDescriptionTruncated)) {
        return `${truncatedDescription.value}...`;
    }
    return truncatedDescription.value;
});

// Distribution truncator ("show more")
// const {
//   data: truncatedFormattedDistributions,
//   toggle: showAllDistributions,
//   isTruncated: isDistributionsTruncated,
// } = useDataTruncator({
//   data: getFormattedDistributions,
//   limit: 7,
// })

const investOpen = ref(false);
</script>

<template>
    <UModal v-model="investOpen" :ui="{ width: 'sm:max-w-5xl', overlay: { background: 'bg-gray-800/75' } }">
        <InvestViewer :asset-id="props.datasetId" @close-modal="investOpen = false" />
    </UModal>

    <div v-if="error" class="grid size-full place-content-center bg-bg-base">
        <KCard class="size-96">
            <template #title> Fehler </template>
            <template #content>
                {{ errorView }}
            </template>
        </KCard>
    </div>
    <div class="container mx-auto">
        <div class="mx-auto w-full max-w-content-max pt-1">
            <section name="dsd-header" class="flex flex-col gap-6">
                <!-- Go previous page -->
                <div class="flex flex-col gap-6">
                    <div class="flex justify-between">
                        <button class="-ml-6 px-4 py-1 cursor-pointer" @click="router.back()">
                            <Typography
                                variant="paragraph-1"
                                class="flex items-center gap-2 text-primary hover:text-primary-hover"
                            >
                                <PhCaretLeft />
                                <span>Back</span>
                            </Typography>
                        </button>
                        <LinkedDataSelector :resource-id="datasetId" resource="datasets" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="flex flex-row items-center justify-between">
                            <h3 class="text-4xl text-primary-600 font-semibold">{{ title }}</h3>
                            <div class="flex flex-row gap-2">
                                <UButton
                                    size="sm"
                                    variant="outline"
                                    :label="$t('buttons.dataLineage')"
                                    :to="{
                                        path:
                                            pistisMode === 'cloud'
                                                ? '/marketplace/dataset-details/data-lineage'
                                                : '/catalog/dataset-details/data-lineage',
                                        query: { id: accessID, pm: pistisMode, url: backendUrl },
                                    }"
                                />
                                <UButton
                                    size="sm"
                                    variant="outline"
                                    label="Quality Assessment"
                                    :to="{
                                        path: '/catalog/dataset-details/data-quality',
                                        query: {
                                            datasetId,
                                            title,
                                            subtitle,
                                        },
                                        external: true,
                                    }"
                                />
                                <template v-if="pistisMode === 'factory'">
                                    <UButton
                                        v-if="catalog === 'my-data'"
                                        size="sm"
                                        color="secondary"
                                        variant="solid"
                                        label="Publish Data"
                                        :to="`/catalog/publish-data?id=${datasetId}`"
                                    />
                                    <UButton
                                        v-if="catalog === 'acquired-data'"
                                        size="sm"
                                        color="secondary"
                                        variant="outline"
                                        label="Rate Dataset"
                                        :to="feedbackUrl"
                                    ></UButton>
                                </template>
                                <template v-if="pistisMode === 'factory' && catalog === 'acquired-data'"></template>
                            </div>
                        </div>
                        <h5 class="text-lg">
                            <span class="italic">by</span> <span class="font-semibold">{{ subtitle }}</span>
                        </h5>
                    </div>
                </div>
            </section>

            <section class="flex flex-row gap-8 items-start mt-4">
                <div class="w-full space-y-8">
                    <UCard
                        :ui="{
                            base: ['w-full flex flex-col transition-[flex-grow] duration-300 ease-in-out relative'],
                        }"
                    >
                        <template #header>
                            <SubHeading title="About this dataset" />
                        </template>

                        <SummaryBox title="Description">
                            <template #text>
                                <div v-html="descriptionMarkup" />
                            </template>
                        </SummaryBox>

                        <div class="mt-4">
                            <slot name="additional-info"></slot>
                        </div>
                    </UCard>

                    <UCard v-if="pistisMode === 'cloud'">
                        <template #header>
                            <SubHeading :title="$t('monetization.header')" />
                        </template>
                        <MonetizationView :data="monetizationData" :offer-type="offerType" />
                    </UCard>

                    <slot name="sections"></slot>

                    <UCard v-if="pistisMode === 'cloud'">
                        <template #header>
                            <SubHeading :title="$t('matchmakingService.recommendationsHeader')" />
                        </template>
                        <MatchingDatasetDetails :dataset-id="datasetId" />
                    </UCard>
                </div>

                <div v-if="pistisMode === 'cloud'" class="flex flex-col gap-4 w-96 sticky top-20 self-start">
                    <template v-if="hasPurchaseOffer">
                        <div
                            v-if="monetizationData.purchase_offer[0].type === 'subscription'"
                            class="flex flex-col gap-4 bg-white rounded-lg border border-neutral-300 p-4 shadow-lg"
                        >
                            <div class="flex justify-between items-center">
                                <div class="text-md font-medium text-neutral-500 uppercase">Price</div>
                                <div class="text-3xl font-bold text-primary-700">
                                    {{ price }} &euro;
                                    <span class="font-medium text-lg text-neutral-500">
                                        /
                                        {{
                                            monetizationData.purchase_offer[0].subscription_frequency === 'yearly'
                                                ? 'year'
                                                : 'month'
                                        }}</span
                                    >
                                </div>
                            </div>

                            <UButton variant="solid" size="lg" color="emerald" block>Subscribe</UButton>
                        </div>
                        <div
                            v-else
                            class="flex flex-col gap-4 bg-white rounded-lg border border-neutral-300 p-4 shadow-lg relative"
                        >
                            <div class="flex justify-between items-center">
                                <div class="text-md font-medium text-neutral-500 uppercase">Price</div>
                                <div class="text-3xl font-bold text-primary-700">
                                    <span v-if="price">{{ price }} &euro;</span>
                                    <span v-else>FREE</span>
                                </div>
                            </div>

                            <div class="sticky top-0 z-50">
                                <UButton variant="solid" size="lg" color="secondary" block @click="buyRequest">
                                    <span v-if="price">Buy</span>
                                    <span v-else>Get</span>
                                </UButton>
                            </div>
                        </div>
                    </template>
                    <div
                        v-if="hasInvestmentOffer"
                        class="flex flex-col gap-4 bg-white rounded-lg border border-neutral-300 p-4 shadow-lg"
                    >
                        <div class="flex justify-between items-center">
                            <div class="text-md font-medium text-neutral-500 uppercase">Price</div>
                            <div class="text-3xl font-bold text-primary-700">
                                {{ price }} &euro;
                                <span class="font-medium text-lg text-neutral-500"> / share</span>
                            </div>
                        </div>

                        <UButton variant="solid" size="lg" color="primary" block @click="investOpen = !investOpen"
                            >Invest</UButton
                        >
                    </div>

                    <UButton v-if="!isOwned" size="sm" variant="link" block :to="feedbackUrl">Provide Feedback</UButton>
                </div>
            </section>
        </div>
    </div>
</template>
