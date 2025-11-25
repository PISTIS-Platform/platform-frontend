<script setup lang="ts">
const isPublished = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);

const props = defineProps({
    datasetId: {
        type: String,
    },
});

const checkMarketplace = async (datasetId: string) => {
    const endpoint = 'https://pistis-market.eu/srv/virtuoso/sparql';

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

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/sparql-results+json',
        },
        body: new URLSearchParams({
            query,
        }),
    });

    const data = await response.json();
    console.log('<<<<<<<<<<<<<<<<<<<<DATA:', data.results.bindings.length);

    return data.results.bindings.length > 0;
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
        <UButton class="bg-gray-300 text-gray-50 hover:bg-gray-300 cursor-not-allowed" icon="i-heroicons-trash">
            Delete dataset
        </UButton>
    </UTooltip>
    <UButton
        v-if="!isPublished"
        class="bg-red-50 ring-1 ring-opacity-25 ring-red-500 text-red-500 hover:bg-red-200"
        icon="i-heroicons-trash"
    >
        Delete dataset
    </UButton>
</template>
