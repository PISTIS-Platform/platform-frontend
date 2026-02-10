<script setup lang="ts">
import { useApiService } from '~/services/apiService';

const config = useRuntimeConfig();

const { getSCEEUrl } = useApiService();
const { data: session } = useAuth();
const token = ref(session.value?.token);

const isDeleting = ref(false);
const deleteSuccess = ref(false);
const deleteError = ref(false);

const deleteInfo = ref<any>(null);

const props = defineProps({
    datasetId: {
        type: String,
    },
    catalog: {
        type: String,
    },
    distributions: {
        type: Array,
    },
});

const router = useRouter();

const dist = ref([]);
watchEffect(async () => {
    dist.value = props.distributions;
});

const { data, status, error } = useAsyncData(() =>
    $fetch('/api/datasets/is-on-marketplace', {
        query: { id: props.datasetId },
    }),
);

const isPublished = computed(() => data.value?.isPublished);
const marketplaceResults = computed(() => data.value?.results);

const offerIds = computed(() => {
    if (!marketplaceResults.value) return [];
    return marketplaceResults.value.map((offer) => offer.id);
});

const isNft = computed(() => {
    if (!marketplaceResults.value) return false;

    return marketplaceResults.value.some((offer) => offer.monetization?.[0]?.purchase_offer?.[0]?.type === 'nft');
});

const isOfferBought = async (offerId: string) => {
    const sceeApi = getSCEEUrl(offerId);
    try {
        const response = await $fetch(sceeApi, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });
        return !!response;
    } catch (err) {
        console.error('SCEE ERROR:', err);
    }
};

const isBought = ref();
watch(
    offerIds,
    async (ids) => {
        if (!ids.length) {
            isBought.value = false;
            return;
        }

        const results = await Promise.all(ids.map((id) => isOfferBought(id)));
        isBought.value = results.some(Boolean);
    },
    { immediate: true },
);

const canDelete = computed(() => status.value === 'success' && error.value === null && isBought.value === false);

const openOfferDetailsPage = (offer) => {
    window.open(`${config.public.factoryUrl}/marketplace/dataset-details/${offer}?pm=cloud`);
};

const showConfirmationWindow = ref(false);

const openConfirmationWindow = () => {
    showConfirmationWindow.value = true;
    deleteError.value = false;
};

const confirmDelete = async () => {
    if (!canDelete.value) {
        deleteError.value = true;
        return;
    }

    isDeleting.value = true;

    const deletedFromMarketplace = ref(false);
    if (isPublished.value && !isNft.value) {
        try {
            for (const offerId of offerIds.value) {
                await $fetch('/api/catalog/delete-offer-from-marketplace', {
                    method: 'DELETE',
                    query: { offerId: offerId },
                });
            }
            deletedFromMarketplace.value = true;
        } catch (err) {
            console.error('DELETE FROM MARKETPLACE ERROR:', err);
            return;
        }
    }

    if (!isPublished.value || (isPublished.value && deletedFromMarketplace.value)) {
        try {
            const response = await $fetch('/api/catalog/delete-dataset', {
                method: 'DELETE',
                query: { datasetId: props.datasetId },
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });

            deleteInfo.value = response.info;
            deleteSuccess.value = true;

            setTimeout(() => {
                showConfirmationWindow.value = false;
                router.back();
            }, 3500);
        } catch (err) {
            console.error('DELETE ERROR:', err);
            deleteError.value = true;
        } finally {
            isDeleting.value = false;
        }
    }
};
</script>

<template>
    <div v-if="props.catalog === 'my-data'">
        <UButton v-if="canDelete" variant="solid" color="red" icon="i-heroicons-trash" @click="openConfirmationWindow">
            Delete dataset
        </UButton>
        <UTooltip v-else text="Dataset has been acquired and cannot be deleted.">
            <UButton :disabled="true" color="red" icon="i-heroicons-trash"> Delete dataset </UButton>
        </UTooltip>
        <UModal v-model="showConfirmationWindow" :ui="{ width: 'max-w-none w-[650px]' }">
            <div v-if="!deleteSuccess">
                <h2 class="text-lg text-gray-700 font-semibold p-6">Delete dataset?</h2>

                <p class="px-6 font-semibold text-gray-700">
                    Are you sure you want to delete this dataset? This action cannot be undone.
                </p>
                <br />
                <p class="px-6 text-gray-700">The following distribution(s) will also be deleted:</p>
                <ul class="px-12 text-gray-700">
                    <li v-for="distribution in dist" :key="distribution.id" class="list-disc">
                        <span class="font-bold text-xs text-gray-700">({{ distribution.format.id }})</span>
                        {{ distribution.title?.en }}
                    </li>
                </ul>

                <div v-if="isPublished">
                    <p class="px-6 pt-10 font-semibold text-gray-700">
                        This dataset has not yet been acquired but it has been published in the marketplace.
                    </p>
                    <br />
                    <p class="px-6 text-gray-700">The following offer(s) will also be deleted:</p>
                    <ul class="px-12">
                        <li
                            v-for="offer in offerIds"
                            :key="offer.id"
                            class="list-disc cursor-pointer underline text-gray-700"
                            @click="openOfferDetailsPage(offer)"
                        >
                            {{ `${config.public.factoryUrl}/marketplace/dataset-details/${offer}` }}
                            <UIcon name="i-heroicons-arrow-top-right-on-square" class="text-pistis-600"></UIcon>
                        </li>
                    </ul>
                </div>

                <div class="flex justify-end space-x-4 p-6">
                    <UButton variant="solid" color="gray" @click="showConfirmationWindow = false">Cancel</UButton>
                    <UButton variant="solid" color="red" @click="confirmDelete">Delete</UButton>
                </div>
                <div v-if="isDeleting" class="flex justify-end text-gray-600 px-6 pb-6">
                    <div class="animate-spin rounded-full h-5 w-5 border-t-2"></div>
                    <p class="text-sm italic pl-2">Deleting dataset and distributions...</p>
                </div>
                <p v-if="deleteError" class="italic text-red-400 px-4 pb-6 text-sm text-right">
                    Something went wrong, please try again.
                </p>
            </div>
            <div v-else class="p-6 text-center">
                <div class="flex justify-center items-center">
                    <h2 class="text-lg font-semibold text-green-600">Dataset successfully deleted</h2>
                    <UIcon name="i-heroicons-check-circle" class="text-xl text-green-500" />
                </div>
                <div v-if="deleteInfo" class="mt-4 text-left text-sm">
                    <p class="font-semibold mb-1">Deleted distributions:</p>
                    <ul class="list-disc pl-5">
                        <li v-for="d in deleteInfo.distributions" :key="d.id">
                            <span class="font-medium">{{ d.title }}</span>
                        </li>
                    </ul>
                    <p v-if="isPublished" class="font-semibold my-1">Deleted from marketplace:</p>
                    <ul class="list-disc pl-5">
                        <li v-for="offer in offerIds" :key="offer.id">
                            <span class="font-medium">{{ offer }}</span>
                        </li>
                    </ul>
                    <p class="font-semibold mb-1 mt-3">Dataset was also removed from:</p>
                    <ul v-if="deleteInfo.metricsDeleted" class="list-disc pl-5">
                        <li>
                            <span class="font-medium">Metrics</span>
                        </li>
                    </ul>
                    <ul v-if="deleteInfo.dataQualityDeleted" class="list-disc pl-5">
                        <li>
                            <span class="font-medium">Data Quality</span>
                        </li>
                    </ul>
                </div>
                <p class="text-gray-600 mt-2">You will be redirected...</p>
            </div>
        </UModal>
    </div>
    <div v-else>
        <UTooltip text="This is an acquired dataset and cannot be deleted.">
            <UButton :disabled="true" color="red" icon="i-heroicons-trash"> Delete dataset </UButton>
        </UTooltip>
    </div>
</template>
