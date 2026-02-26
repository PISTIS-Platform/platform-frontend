<script setup lang="ts">
import { useApiService } from '~/services/apiService';

const { getSCEEBurnNftUrl, getMarketplaceDatasetUrl, getSCEEAssetUrl } = useApiService();
const { data: session } = useAuth();
const token = ref(session.value?.token);

const isDeleting = ref(false);
const deleteSuccess = ref(false);
const deleteError = ref(false);

const props = defineProps({
    datasetId: {
        type: String,
    },
});

const router = useRouter();

// for nft datasets:
const isNft = ref(false);
const nftId = ref<string | null>(null);

const isNftOffer = async (datasetId: string): Promise<boolean> => {
    const sceeApi = getSCEEAssetUrl(datasetId);
    try {
        const response = await $fetch(sceeApi, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });
        return response?.response?.sale?.saleType === 'nft';
    } catch (err) {
        console.error('SCEE ERROR:', err);
        return false;
    }
};

const getNftId = async (datasetId: string): Promise<string | null> => {
    const marketplaceApi = getMarketplaceDatasetUrl(datasetId);

    try {
        const response = await $fetch(marketplaceApi, {
            method: 'GET',
        });

        return response.result.monetization?.[0]?.purchase_offer?.[0]?.nft_id ?? null;
    } catch (err) {
        console.error('SCEE ERROR:', err);
        return null;
    }
};

watch(
    () => props.datasetId,
    async (datasetId) => {
        if (!datasetId) {
            nftId.value = null;
            return;
        }

        isNft.value = await isNftOffer(datasetId);

        if (isNft.value) {
            nftId.value = await getNftId(datasetId);
        } else {
            nftId.value = null;
        }
    },
    { immediate: true },
);

const showConfirmationWindow = ref(false);

const openConfirmationWindow = () => {
    showConfirmationWindow.value = true;
    deleteError.value = false;
};

const confirmDelete = async () => {
    isDeleting.value = true;

    const isBurned = ref(false);
    if (isNft.value) {
        const sceeBurnNftApi = getSCEEBurnNftUrl();
        try {
            await $fetch(sceeBurnNftApi, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.value}`,
                    'Content-Type': 'application/json',
                },
                body: {
                    nft_id: nftId.value,
                },
            });
            isBurned.value = true;
        } catch (err) {
            console.error('BURN NFT ERROR:', err);
            isDeleting.value = false;
            deleteError.value = true;
            return;
        }
    }

    if ((isNft.value && isBurned.value) || !isNft.value) {
        try {
            await $fetch('/api/catalog/delete-offer-from-marketplace', {
                method: 'DELETE',
                query: { offerId: props.datasetId },
            });

            deleteSuccess.value = true;

            setTimeout(() => {
                showConfirmationWindow.value = false;
                router.back();
            }, 3500);
        } catch (err) {
            console.error('DELETE FROM MARKETPLACE ERROR:', err);
            isDeleting.value = false;
            deleteError.value = true;
            return;
        }
    }
};
</script>

<template>
    <div>
        <UButton
            v-if="!isDeleting"
            size="sm"
            color="secondary"
            variant="solid"
            label="Unpublish"
            @click="openConfirmationWindow"
        />
        <UTooltip v-else text="Dataset gets unpublished...">
            <UButton :disabled="true" color="secondary" size="sm" label="Unpublish" />
        </UTooltip>
        <UModal v-model="showConfirmationWindow" :ui="{ width: 'max-w-none w-[650px]' }">
            <div v-if="!deleteSuccess">
                <div v-if="!isNft">
                    <h2 class="text-lg text-gray-700 font-semibold p-6">Unpublish offer?</h2>

                    <p class="px-6 font-semibold text-gray-700">
                        Are you sure you want to remove this offer from the marketplace?
                    </p>
                </div>
                <div v-else>
                    <h2 class="text-lg text-gray-700 font-semibold p-6">Unpublish NFT?</h2>

                    <p class="px-6 font-semibold text-gray-700">
                        Are you sure you want to remove this NFT from the marketplace?
                    </p>
                </div>

                <br />

                <div class="flex justify-end space-x-4 p-6">
                    <UButton variant="solid" color="gray" @click="showConfirmationWindow = false">Cancel</UButton>
                    <UButton v-if="isDeleting" :disabled="true" variant="solid" color="red">Unpublish</UButton>
                    <UButton v-else variant="solid" color="red" @click="confirmDelete">Unpublish</UButton>
                </div>
                <div v-if="isDeleting" class="flex justify-end text-gray-600 px-6 pb-6">
                    <div class="animate-spin rounded-full h-5 w-5 border-t-2"></div>
                    <p class="text-sm italic pl-2">Unpublishing offer...</p>
                </div>
                <p v-if="deleteError" class="italic text-red-400 px-4 pb-6 text-sm text-right">
                    Something went wrong, please try again.
                </p>
            </div>
            <div v-else class="p-6 text-center">
                <div class="flex justify-center items-center">
                    <h2 class="text-lg font-semibold text-green-600">Offer unpublished successfully</h2>
                    <UIcon name="i-heroicons-check-circle" class="text-xl text-green-500" />
                </div>
                <p class="text-gray-600 mt-2">You will be redirected...</p>
            </div>
        </UModal>
    </div>
</template>
