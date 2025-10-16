<template>
    <div>
        <div v-if="!headerChosen">
            <SelectHeaderTable :toggle-header-chosen="toggleHeaderChosen" />
        </div>
        <div v-else ref="enrichmentRef">
            <DataEnricher
                :dataset-id="datasetId"
                :distribution-id="distributionId"
                :toggle-header-chosen="toggleHeaderChosen"
            />
        </div>
    </div>
</template>

<script setup>
import { useDataEnrichmentStore } from '~/store/dataEnrichment';

const store = useDataEnrichmentStore();

const route = useRoute();

const headerChosen = ref(false);
const enrichmentRef = ref(null);

const datasetId = ref('');
const distributionId = ref('');
const type = ref('');

if (Object.keys(route.query).length !== 0) {
    datasetId.value = route.query.datasetId;
    distributionId.value = route.query.distributionId;
    type.value = route.query.file_type;
}

onMounted(() => {
    if (datasetId.value) {
        store.setDatasetId(datasetId.value);
    }
    if (distributionId.value) {
        store.setDistributionId(distributionId.value);
    }
    if (type.value) {
        store.setFileType(type.value);
    }
    store.selectFile();
});

function toggleHeaderChosen() {
    headerChosen.value = !headerChosen.value;
}
</script>
