<script setup lang="ts">
const isPublished = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);
const fetchSuccess = ref(false);
const deleteSuccess = ref(false);
const deleteError = ref(false);

import { useApiService } from '~/services/apiService';

const route = useRoute();
const pistisMode = route.query.pm;

const { getMarketplaceSparqlEndpoint } = useApiService(pistisMode);

const props = defineProps({
    datasetId: {
        type: String,
    },
});

const router = useRouter();

const checkMarketplace = async (datasetId: string) => {
    const endpoint = getMarketplaceSparqlEndpoint();

    const query = `
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
        PREFIX pistis: <https://www.pistis-project.eu/ns/voc#>

        SELECT ?dataset
        WHERE {
            ?offer a pistis:Offer ;
                pistis:originalId "${datasetId}" .

            ?dataset a dcat:Dataset ;
                pistis:offer ?offer .
        }
    `;

    const params = new URLSearchParams({
        query,
        format: 'application/sparql-results+json',
    });

    try {
        const response = await fetch(`${endpoint}?${params.toString()}`, {
            headers: {
                Accept: 'application/sparql-results+json',
            },
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(`Fetch failed: ${msg}`);
        }

        const data = await response.json();

        fetchSuccess.value = true;
        return data.results.bindings.length > 0;
    } catch (error) {
        console.error('SPARQL direct fetch failed:', error);
        throw error;
    }
};

const showConfirmationWindow = ref(false);

const openConfirmationWindow = () => {
    showConfirmationWindow.value = true;
    deleteError.value = false;
};

const confirmDelete = async () => {
    try {
        const _response = await $fetch('/api/catalog/delete-dataset', {
            method: 'DELETE',
            query: { datasetId: props.datasetId },
        });

        deleteSuccess.value = true;

        setTimeout(() => {
            showConfirmationWindow.value = false;
            router.back();
        }, 1500);
    } catch (err) {
        console.error('DELETE ERROR:', err);
        deleteError.value = true;
    }
};

onMounted(async () => {
    try {
        isPublished.value = await checkMarketplace(props.datasetId);
    } catch (e) {
        error.value = e.message;
        console.log('ERROR:', error.value);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <UTooltip v-if="isPublished" text="Dataset has been published and cannot be deleted.">
        <UButton class="bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-not-allowed" icon="i-heroicons-trash">
            Delete dataset
        </UButton>
    </UTooltip>
    <UButton
        v-if="fetchSuccess && !isPublished"
        variant="soft"
        color="red"
        icon="i-heroicons-trash"
        @click="openConfirmationWindow"
    >
        Delete dataset
    </UButton>
    <UModal v-model="showConfirmationWindow" :ui="{ width: 'max-w-none w-[500px]' }">
        <div v-if="!deleteSuccess">
            <h2 class="text-lg font-semibold p-4">Delete dataset?</h2>

            <p class="px-4">Are you sure you want to delete this dataset? This action cannot be undone.</p>

            <div class="flex justify-end space-x-4 p-4">
                <UButton variant="soft" color="gray" @click="showConfirmationWindow = false">Cancel</UButton>
                <UButton variant="soft" color="red" @click="confirmDelete">Delete</UButton>
            </div>
            <p v-if="deleteError" class="italic text-red-400 px-4 pb-4 text-sm text-right">
                Something went wrong, please try again.
            </p>
        </div>
        <div v-else class="p-6 text-center">
            <div class="flex justify-center items-center">
                <h2 class="text-lg font-semibold text-green-600">Dataset successfully deleted</h2>
                <UIcon name="i-heroicons-check-circle" class="text-xl text-green-500" />
            </div>
            <p class="text-gray-600 mt-2">You will be redirected...</p>
        </div>
    </UModal>
</template>
