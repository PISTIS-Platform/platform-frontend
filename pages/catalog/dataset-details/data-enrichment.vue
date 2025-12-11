<template>
    <div>
        <button class="-ml-6 px-4 py-1 cursor-pointer" @click="backButton">
            <Typography variant="paragraph-1" class="flex items-center gap-2 text-primary hover:text-primary-hover">
                <PhCaretLeft />
                <span>Back</span>
            </Typography>
        </button>
        <div v-if="isLoading" class="flex flex-col justify-center items-center h-64">
            <UProgress animation="swing" color="secondary" />
        </div>
        <div v-else>
            <DataEnricher />
        </div>
    </div>
</template>

<script setup>
import { useDataEnrichmentStore } from '~/store/dataEnrichment';
import PhCaretLeft from '~icons/ph/caret-left';

const store = useDataEnrichmentStore();

const isLoading = ref(true);

const route = useRoute();

const datasetId = ref('');
const distributionId = ref('');
const type = ref('');

if (Object.keys(route.query).length !== 0) {
    datasetId.value = route.query.datasetId;
    distributionId.value = route.query.distributionId;
    type.value = route.query.file_type;
}

function backButton() {
    navigateTo(`${datasetId.value}?pm=factory`);
}
onMounted(async () => {
    if (datasetId.value) {
        store.setDatasetId(datasetId.value);
    }
    if (distributionId.value) {
        store.setDistributionId(distributionId.value);
    }
    if (type.value) {
        store.setFileType(type.value);
    }
    try {
        await store.selectFile();
        await store.fetchOptions();
    } finally {
        isLoading.value = false;
    }
});
</script>
