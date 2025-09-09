<!-- eslint-disable prettier/prettier -->
<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import axios from 'axios';
import axios from 'axios';

//import { useStore } from 'vuex';
import { useDataTruncator } from '@/composables/useDataTruncator';
// import config from '@/pages/catalog/config/appConfig';
import PhCaretLeft from '~icons/ph/caret-left';

import LinkedDataSelector from './LinkedDataSelector.vue';

// import { useAuthStore } from '../../stores/authStore';
// import LinkedDataSelector from '../base/links/LinkedDataSelector.vue';

// import MatchmakingServiceView from '../matchmaking-service/MatchmakingServiceView.vue';
// import MonetizationView from '../monetization/MonetizationView.vue';
// import keycloak from '@/services/keycloak'

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

// const { appContext } = getCurrentInstance();
// const store = useStore();
// const authStore = useAuthStore();
const { data: session } = useAuth();

const token = ref(session.value?.token);
const { data: session } = useAuth();

const token = ref(session.value?.token);

let searchUrl = '';
if (pistisMode === 'factory') {
    searchUrl = config.public.factoryUrl + '/srv/search/';
} else {
    searchUrl = config.public.cloudUrl + '/srv/search/';
}

const userFactoryUrl = 'https://pistis-market.eu/srv/factories-registry/api/factories/user-factory';
const userFactoryUrl = 'https://pistis-market.eu/srv/factories-registry/api/factories/user-factory';
const distributionID = ref(null);
const accessID = ref(null);
const metadata = ref(null);
const organizationId = ref(null);
const organizationId = ref(null);
const catalog = ref(null);
// const token = ref(authStore.user.token);
const factoryPrefix = ref('');
const price = ref('');
const isOwned = computed(() => {
    // True only in datasets that the logged-in user owns
    return organizationId.value === monetizationData.value?.publisher?.organization_id;
});
const isOwned = computed(() => {
    // True only in datasets that the logged-in user owns
    return organizationId.value === monetizationData.value?.publisher?.organization_id;
});
const monetizationData = ref();

const setDistributionID = async (data) => {
    distributionID.value = data['result']['distributions'][0].id;
};

const setAccessID = async (data) => {
    try {
        let accessIDFound = false;
        for (const distribution of data['result']['distributions']) {
            if (distribution['access_url'] && distribution['access_url'][0]) {
                const parts = distribution['access_url'][0].split('asset_uuid=');
                accessID.value = parts[parts.length - 1];
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

const fetchMetadata = async () => {
    try {
        const response = await fetch(`${searchUrl}datasets/${props.datasetId}`);
        const data = await response.json();
        metadata.value = data;
        catalog.value = data.result.catalog.id;
        if (pistisMode == 'cloud') {
            // const purchaseOffer = metadata.value.result.monetization[0].purchase_offer;
            // console.log('preis:' + purchaseOffer.price);
            monetizationData.value = metadata.value.result.monetization[0];
            price.value = monetizationData.value?.purchase_offer[0].price;
            price.value = monetizationData.value?.purchase_offer[0].price;
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

const buyRequest = async (factoryPrefix) => {
    try {
        // TODO: link as ENV variable, and add the access token once keycloak is intigrated
        const _response = await axios.post(
            `https://${factoryPrefix}.pistis-market.eu/srv/smart-contract-execution-engine/api/scee/storePurchase`,
            {
                // The request body object
                assetId: props.datasetId,
                assetFactory: monetizationData.value?.purchase_offer[0].publisher?.organization_id,
                sellerId: metadata.value.result?.monetization[0]?.seller_id,
                price: monetizationData.value?.purchase_offer[0].price,
            },
            {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                    'Content-Type': 'application/json',
                },
            },
        );
        // TODO: first use default language and only then the fallback
        //   await store.dispatch('snackbar/showSnackbar', {
        //     message: `Successfully purchased ${Object.values(metadata.value.result?.title)[0]}`,
        //     variant: 'success',
        //   })
    } catch (error) {
        console.error(error);
        // const errorMessage = error?.response?.data?.reason || 'An error occurred while processing your request.';
        //   await store.dispatch('snackbar/showError', errorMessage)
    }
};

onMounted(() => {
    fetchMetadata();
    getUserFactory();
    getUserFactory();
});

// Dataset desecription truncator "show more"
const {
    data: truncatedDescription,
    toggle: toggleDescription,
    isTruncated: isDescriptionTruncated,
    isTruncationNeeded: isDescriptionTruncationNeeded,
} = useDataTruncator({
    data: computed(() => props.descriptionMarkup || ''),
    limit: 550,
});

const truncatedEllipsedDescription = computed(() => {
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
</script>

<template>
    <div v-if="error" class="grid size-full place-content-center bg-bg-base">
        <KCard class="size-96">
            <template #title> Fehler </template>
            <template #content>
                {{ errorView }}
            </template>
        </KCard>
    </div>
    <div class="container mx-auto p-8 pt-4">
        <div class="mx-auto w-full max-w-content-max space-y-12 pt-1">
            <section name="dsd-header" class="flex flex-col gap-6">
                <!-- Go previous page -->
                <div class="flex flex-col gap-6">
                    <div class="flex justify-between">
                        <button class="-ml-6 mt-[10px] px-4 py-1 cursor-pointer" @click="router.back()">
                            <Typography
                                variant="paragraph-1"
                                class="flex items-center gap-2 text-primary hover:text-primary-hover"
                            >
                                <PhCaretLeft />
                                <span>back</span>
                            </Typography>
                        </button>
                        <LinkedDataSelector :resource-id="datasetId" resource="datasets" />
                    </div>
                    <DetailsPageHeader :headline="headline" :title="title" :subtitle="subtitle">
                        <template #subtitle>
                            <slot name="subtitle" :subtitle="subtitle">
                                <span>{{ subtitle }}</span>
                                <!-- <RouterLink
                                    :to="{ name: 'Datasets', query: { catalog: resultEnhanced?.getCatalogId } }"
                                    class="by-link"
                                /> -->
                            </slot>
                        </template>
                    </DetailsPageHeader>
                </div>
                <!-- Metadata -->
                <slot name="metadata">
                    <div class="flex flex-col justify-between md:flex-row">
                        <SummaryBox
                            v-for="(s, i) in summary"
                            :key="i"
                            class="mb-4 mr-4 flex-1"
                            :title="s.title"
                            :text="s.text || '-'"
                        />
                        <!-- <SummaryBox class="mb-4 mr-4 flex-1" title="Datenbereitsteller" :text="resultEnhanced?.getPublisher?.name || '-'" />
              <SummaryBox class="mb-4 mr-4 flex-1" title="Aktualisiert" :text="resultEnhanced?.getModified || '-'" /> -->
                    </div>
                </slot>
            </section>
            <section>
                <TabGroup
                    :tabs="[
                        {
                            id: 'dataset',
                            title: 'Info',
                            content: truncatedEllipsedDescription || '',
                        },
                    ]"
                    class="ring-1 ring-gray-200 shadow rounded-lg"
                >
                    <template #default="{ id, content }">
                        <template v-if="id === 'dataset'">
                            <div class="flex flex-col gap-4">
                                <div>
                                    <Typography as="h5" variant="by-heading-4" class="mb-8">
                                        <slot name="about-this-dataset"> About this dataset </slot>
                                    </Typography>
                                    <Typography as="p" variant="by-copy-small-regular">
                                        <div class="markdown-content" v-html="content" />
                                    </Typography>
                                </div>
                                <button
                                    v-if="isDescriptionTruncationNeeded"
                                    class="grid w-full place-content-center"
                                    @click="toggleDescription"
                                >
                                    <div
                                        class="flex flex-col items-center justify-center text-primary text-xs/6 font-bold"
                                    >
                                        <span>Mehr lesen</span>
                                        <i v-if="isDescriptionTruncated" class="icon-[ph--caret-down]" />
                                        <i v-else class="icon-[ph--caret-up]" />
                                    </div>
                                </button>
                            </div>
                        </template>
                    </template>
                </TabGroup>
            </section>
            <!-- Cloud (Marketplace) -->
            <div v-if="pistisMode === 'cloud'">
                <section class="container custom_nav_container flex">
                    <div class="btn_holder flex gap-5 flex-wrap">
                        <a :href="'#'" class="" @click.prevent="buyRequest(factoryPrefix)">
                            <KButton size="small"
                                >Buy<span v-if="price">&nbsp;{{ price + '€' }}</span></KButton
                            >
                        </a>
                        <a :href="`/usage-analytics/${datasetId}/questionnaire`" class="">
                            <KButton v-if="!isOwned" size="small">Provide Feedback</KButton>
                            <KButton v-if="!isOwned" size="small">Provide Feedback</KButton>
                        </a>
                    </div>
                    <!-- Data Lineage (Button placements should be discussed together)-->
                    <div class="ml-5">
                    <div class="ml-5">
                        <NuxtLink
                            :to="{
                                path: '/catalog/dataset-details/data-lineage',
                                query: { id: datasetId, pm: pistisMode },
                            }"
                            class=""
                        >
                            <KButton size="small">{{ $t('buttons.dataLineage') }}</KButton>
                        </NuxtLink>
                    </div>
                </section>
            </div>
            <!-- Factory (My Data) -->
            <div v-else-if="pistisMode === 'factory'">
                <section class="container custom_nav_container">
                    <template v-if="catalog === 'my-data'">
                        <div class="btn_holder flex gap-5 flex-wrap">
                            <!-- Data Lineage -->
                            <NuxtLink
                                :to="{
                                    path: '/catalog/dataset-details/data-lineage',
                                    query: { id: datasetId, pm: pistisMode },
                                }"
                                class=""
                            >
                                <KButton size="small">{{ $t('buttons.dataLineage') }}</KButton>
                            </NuxtLink>
                            <a :href="`/catalog/dataset-details/${datasetId}/quality`" class="link"
                                ><KButton size="small">Quality Assessment</KButton></a
                            >
                            <a :href="`/data/publish-data/${datasetId}`" class="link"
                                ><KButton size="small">Publish Data</KButton></a
                            >
                        </div>
                    </template>
                    <template v-if="catalog === 'acquired-data'">
                        <div class="btn_holder flex gap-5 flex-wrap">
                            <!-- Data Lineage -->
                            <NuxtLink
                                :to="{
                                    path: '/catalog/dataset-details/data-lineage',
                                    query: { id: datasetId, pm: pistisMode },
                                }"
                                class=""
                            >
                                <KButton size="small">{{ $t('buttons.dataLineage') }}</KButton>
                            </NuxtLink>
                            <a :href="`/catalog/dataset-details/${datasetId}/quality`" class="link"
                                ><KButton size="small">Quality Assessment</KButton></a
                            >
                            <a :href="`/usage-analytics/${datasetId}/questionnaire`" class="link"
                                ><KButton size="small">Provide Feedback</KButton></a
                            >
                        </div>
                    </template>
                </section>
            </div>
            <slot name="sections"> </slot>
            <div v-if="pistisMode === 'cloud'" class="bg-white p-6 rounded-lg ring-1 ring-gray-200 shadow">
                <MonetizationView :data="monetizationData" />
            </div>
            <div v-if="pistisMode === 'cloud'" class="bg-white p-6 rounded-lg ring-1 ring-gray-200 shadow">
                <MatchmakingServiceView :dataset-id="datasetId" />
            </div>
        </div>
    </div>
</template>
