<template>
    <div>
        <button class="-ml-6 px-4 py-1 cursor-pointer" @click="backButton">
            <Typography variant="paragraph-1" class="flex items-center gap-2 text-primary hover:text-primary-hover">
                <PhCaretLeft />
                <span>Back</span>
            </Typography>
        </button>
        <div v-if="!headerChosen">
            <SelectHeaderTable :toggle-header-chosen="toggleHeaderChosen" />
        </div>
        <div v-else ref="enrichmentRef">
            <DataEnricher />
        </div>
    </div>
</template>

<script setup>
import { useDataEnrichmentStore } from '~/store/dataEnrichment';
import PhCaretLeft from '~icons/ph/caret-left';

const store = useDataEnrichmentStore();

const router = useRouter();
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

function backButton() {
    if (!headerChosen.value) {
        router.back();
    } else {
        store.restoreOriginalFileData();
        toggleHeaderChosen();
    }
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
