<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { type Dataset, type Preview, type TableRow } from '~/interfaces/dataset-preview';
import { type ConfigEmit, type ObfuscationBody, type SortedMasks } from '~/interfaces/mask-settings';
import { useAnonymizerStore } from '~/store/anonymizer';

import Title from '../../components/anonymizer/Title.vue';
import { formatPreview } from './data';
/**
 * Translater for the page.
 */
const { t } = useI18n();

/**
 * Title of the page
 */
const title: string = `${t('anonymizer.anonymizer')} - ${t('anonymizer.obfuscation')}`;

/**
 * Reference to the anonymiser pinia store
 */
const anonymizerStore = useAnonymizerStore();

/**
 * Reference to nuxt router.
 */
const router = useRouter();

/**
 * Preview of the dataset before anonymisation.
 */
const rawPreview = reactive({
    rows: anonymizerStore.tableRows,
    columns: anonymizerStore.metadata.types,
    recommendation: anonymizerStore.metadata.recommendation,
});

/**
 * Update preview on mutation of pinia store state.
 */
anonymizerStore.$subscribe((mutation, state) => {
    rawPreview.rows = state.tableRows;
    rawPreview.columns = state.metadata.types;
    rawPreview.recommendation = state.metadata.recommendation;
});

/**
 * Obfuscated data to be displayed in a table.
 */
const obfuscatedRows = ref<TableRow[]>([]);

/**
 * Boolean that indicates whether masks are available
 */
const masksAreLoaded = ref<boolean>(false);

/**
 * List of all masks stored by data type that they are applicable to.
 */
const masks = ref<SortedMasks>({ STRING: [], NUMBER: [] });

/**
 * Request body to be sent to anonymiser obfuscation endpoints.
 */
const obfuscationBody = reactive<ObfuscationBody>({});

/**
 * Boolean flag that will hide the obfuscation preview.
 */
const hidePreview = ref<boolean>(true);

/**
 * Trigger for the preview transformation button loading animation.
 */
const loadingPreview = ref<boolean>(false);

/**
 * Trigger for the apply transformation button loading animation
 */
const submittingObfuscation = ref<boolean>(false);

/**
 * Fetch a list of available masks from the backend.
 *
 * @returns A promise containing a list of masks sorted by data type.
 */
async function loadAvailableMasks(): Promise<SortedMasks> {
    const response = await useFetch('/api/anonymizer/mask');
    const masks = response.data.value;
    return masks.result;
}

/**
 * Add a configuration to the `obfuscationBody`. If the column
 * name already exists in the `obfuscationBody` it is removed and
 * the new config will replace it.
 *
 * @param config configuration to add to the `obfuscationBody`
 */
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
}

/**
 * Anonymise the dataset.
 *
 * @param isPreview If `true` only the preview will be loaded into the preview table. Otherwise update the dataset in the postgres database.
 */
async function submitObfuscation(isPreview: boolean): Promise<void> {
    //Check if one column is altered
    if (Object.keys(obfuscationBody).length === 0) {
        window.alert('Please configure a transformation!');
    } else if (
        obfuscationBody['delete'] &&
        obfuscationBody['delete'].length === Object.keys(rawPreview.columns).length
    ) {
        window.alert('You cannot delete all columns in a dataset!');
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
            let dataset = (await $fetch('/api/anonymizer/preview', {
                method: 'POST',
                body: {
                    config: obfuscationBody,
                },
            })) as Dataset;

            obfuscatedRows.value = formatPreview(dataset);

            loadingPreview.value = false;
        } else {
            submittingObfuscation.value = true;
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
            submittingObfuscation.value = false;
            //temporary fix for weirdness that happens after anonymization
            router.push({ name: 'anonymizer' });
        }
    }
}

/**
 * Load mask types on mount.
 */
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
                <UButton class="w-44 mt-5" :loading="submittingObfuscation" @click="submitObfuscation(false)"
                    >Apply Transformation</UButton
                >
            </div>
        </div>
    </UCard>
</template>
~/store/anonymizer
