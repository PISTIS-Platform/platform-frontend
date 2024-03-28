<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Dataset, Preview, TableRow } from '~/interfaces/dataset-preview';
import { ConfigEmit, ObfuscationBody, SortedMasks } from '~/interfaces/mask-settings';
import { useAnonymizerStore } from '~/store/anonymizer';

import Title from '../../components/anonymizer/Title.vue';
import { formatPreview } from './data';

const { t } = useI18n();

const title: string = `${t('anonymizer.anonymizer')} - ${t('anonymizer.obfuscation')}`;
const anonymizerStore = useAnonymizerStore();

//Preview before anonymization
const rawPreview = reactive({
    rows: anonymizerStore.tableRows,
    columns: anonymizerStore.metadata.types,
    recommendation: anonymizerStore.metadata.recommendation,
});

anonymizerStore.$subscribe((mutation, state) => {
    rawPreview.rows = state.tableRows;
    rawPreview.columns = state.metadata.types;
    rawPreview.recommendation = state.metadata.recommendation;
});

//Table rows after anonymization
const obfuscatedRows = ref<TableRow[]>([]);

//Masks sorted by applicable data type
const masksAreLoaded = ref<boolean>(false);
const masks = ref<SortedMasks>({ STRING: [], NUMBER: [] });

//Request body used for obfuscation and obfuscation preview
const obfuscationBody = reactive<ObfuscationBody>({});
const hidePreview = ref<boolean>(true);
const loadingPreview = ref<boolean>(false);

//Get list of available masks from the anonymizer
async function loadAvailableMasks(): Promise<SortedMasks> {
    const response = await useFetch('/api/anonymizer/mask');
    const masks = response.data.value;
    return masks.result;
}

//Reconfigure request body
function configureBody(config: ConfigEmit): void {
    //Remove previous occurences of the column's config
    for (const [mask, columns] of Object.entries(obfuscationBody)) {
        columns.forEach((column, index) => {
            if (config.config.name === column.name) {
                if (columns.length > 1) {
                    obfuscationBody[mask].splice(index, 1);
                } else {
                    delete obfuscationBody[mask];
                }
            }
        });
    }

    if (config.mask !== 'none') {
        //Create mask key if necessary and add config
        if (!obfuscationBody[config.mask]) {
            obfuscationBody[config.mask] = [];
        }
        obfuscationBody[config.mask].push(config.config);
    }

    console.log(obfuscationBody);
}

async function submitObfuscation(isPreview: boolean): Promise<void> {
    //Check if one column is altered
    if (Object.keys(obfuscationBody).length === 0) {
        window.alert('Please configure a transformation!');
    } else if (
        obfuscationBody['location'] &&
        (obfuscationBody['location'].length !== 2 ||
            obfuscationBody['location'][0]['isLat'] == obfuscationBody['location'][1]['isLat'])
    ) {
        //Alert if location mask settings are incorrect
        window.alert('When using location mask you must select a latitude and longitude column!');
    } else {
        if (isPreview) {
            hidePreview.value = false;
            loadingPreview.value = true;

            //Fetch a preview of the obfuscation
            let response = await useFetch('/api/anonymizer/preview', {
                method: 'POST',
                body: {
                    config: obfuscationBody,
                },
            });

            let dataset = response.data.value as Dataset;
            obfuscatedRows.value = formatPreview(dataset);

            loadingPreview.value = false;
        } else {
            //Apply the obfuscation to the entire original dataset
            const response = await useFetch('/api/anonymizer/obfuscate', {
                method: 'POST',
                body: {
                    config: obfuscationBody,
                },
            });

            if (response.data.value['code'] === 200) {
                window.alert('Successfully anonymized dataset!');
            } else {
                window.alert('Something went wrong!');
            }

            //Update preview to reflect changes
            const updatedData = await useFetch('/api/anonymizer/preview');
            const data = updatedData.data.value;

            const result: Preview = data.result;
            anonymizerStore.changePreview(result);
            delete obfuscationBody.delete;

            hidePreview.value = true;
        }
    }
}

onMounted(async () => {
    //Load needed information from the anonymizer
    if (anonymizerStore.getMasks.STRING.length === 0) {
        masks.value = await loadAvailableMasks();
        masksAreLoaded.value = true;
        anonymizerStore.changeMasks(masks.value);
    } else {
        masks.value = anonymizerStore.getMasks;
        masksAreLoaded.value = true;
    }
});
</script>

<template>
    <Title :title="title" />
    <UCard class="w-full">
        <div class="w-full flex flex-col gap-5">
            <h2 class="text-2xl">Data Preview</h2>
            <UTable :rows="rawPreview.rows" :loading="rawPreview.rows.length === 0" />

            <h2 class="text-2xl">Obfuscation Settings</h2>
            <div v-if="masksAreLoaded" class="w-full flex overflow-x-scroll gap-2 pb-5">
                <MaskTile
                    v-for="(type, column) in rawPreview.columns"
                    :key="column"
                    :column="column"
                    :masks="masks[type]"
                    :default="rawPreview.recommendation[column]"
                    @config-change="
                        (config: ConfigEmit) => {
                            configureBody(config);
                        }
                    "
                />
            </div>
            <h1 v-else>Masks are loading...</h1>
            <UButton class="w-48" :disabled="loadingPreview" @click="submitObfuscation(true)"
                >Preview Transformation
            </UButton>

            <div :hidden="hidePreview" class="mt-3">
                <h1 class="text-2xl">Anonymization Preview</h1>
                <UTable class="mt-5" :rows="obfuscatedRows" :loading="loadingPreview" />
                <UButton class="w-44 mt-5" @click="submitObfuscation(false)">Apply Transformation</UButton>
            </div>
        </div>
    </UCard>
</template>
~/store/anonymizer
