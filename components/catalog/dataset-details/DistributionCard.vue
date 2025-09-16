<script setup lang="ts">
import type { PropertyTableEntryNode } from '@piveau/sdk-vue';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

// import config from '@/pages/catalog/config/appConfig';
import { PropertyTable } from './PropertyTableRow';

// import { useAuthStore } from '../../stores/authStore';
// import LinkedDataSelector from '../base/links/LinkedDataSelector.vue';

const route = useRoute();
const config = useRuntimeConfig();

const pistisMode = route.query.pm;

interface CardProps {
    title: string;
    description: string;
    format: string;
    downloadText?: string;
    saveText?: string;
    lastUpdated?: string;
    downloadUrl: string;
    linkedData?: Record<string, string>;
    datasetId: string;
    distributionId: string;
    data: PropertyTableEntryNode;
    onSave?: () => void;
}

const props = withDefaults(defineProps<CardProps>(), {
    downloadText: 'Download',
    saveText: 'Beschreibung speichern',
    lastUpdated: '',
    onSave: () => {},
});

const { data: session } = useAuth();
const token = session.value?.token;

const dataOrder = ['modified', 'license', 'created', 'languages'];
// const pistisMode = config.pistisMode;
const resolvedData = computed(() => {
    const sortedData = [...(props.data.data || [])].sort((a, b) => {
        // const aIndex = dataOrder.indexOf(a.id) === -1 ? dataOrder.length : dataOrder.indexOf(a.id);
        const aIndex = dataOrder.includes(a.id) ? dataOrder.indexOf(a.id) : dataOrder.length;
        // const bIndex = dataOrder.indexOf(b.id) === -1 ? dataOrder.length : dataOrder.indexOf(b.id);
        const bIndex = dataOrder.includes(b.id) ? dataOrder.indexOf(b.id) : dataOrder.length;

        return aIndex - bIndex;
    });

    return sortedData;
});

const catalog = ref(null);
let url = '';
if (route.query.pm === 'factory') {
    url = config.public.factoryUrl;
} else {
    url = config.public.cloudUrl;
}
const searchUrl = url + '/srv/search/';

const isTransformed = ref();
const isAnonymized = ref();

const fetchMetadata = async () => {
    try {
        const response = await fetch(`${searchUrl}datasets/${props.datasetId}`);
        const data = await response.json();
        catalog.value = data.result.catalog.id;
        isTransformed.value = data.result.distributions.some((transformation) => transformation?.is_transformed);
        isAnonymized.value = data.result.distributions.some((anonymization) => anonymization?.is_anonymized);
    } catch (error) {
        console.error('Error fetching the metadata. ERROR: ', error);
    }
};

onMounted(() => {
    fetchMetadata();
});

// Determine filename based on title if possible:
let downloadFileName = 'download';
const titleObject = props.title;
if (titleObject) {
    const keys = Object.keys(titleObject);
    if (keys) {
        if (keys.includes('en')) {
            downloadFileName = titleObject.en;
        } else {
            downloadFileName = titleObject[keys[0]];
        }
    }
}

async function downloadFile() {
    const accessUrl = props.downloadUrl;
    try {
        console.log('accessUrl', accessUrl, props.format);

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
        };
        if (props.format === 'SQL') {
            config.params = { JSON_output: 'False' };
        }

        const response = await axios.get(accessUrl, config);

        const contentTypeHeader = response.headers['content-type'];
        const contentType = contentTypeHeader.split(';')[0].trim();

        // Map Content-Type to file extensions
        const mimeToExtensionMap = {
            'text/csv': 'csv',
            'application/json': 'json',
            'application/pdf': 'pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'text/plain': 'txt',
        };

        // Determine the file extension from Content-Type
        const fileExtension = mimeToExtensionMap[contentType] || 'bin'; // Default to 'bin' for unknown types
        const fileName = `${downloadFileName}.${fileExtension}`;
        // Create a Blob URL with the detected Content-Type
        const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName; // Use the dynamically determined filename
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download the file.');
    }
}
</script>

<template>
    <div class="mb-3 rounded-lg border-b-none bg-white ring-1 ring-gray-200 shadow p-4">
        <div>
            <div class="flex items-start justify-between">
                <Typography as="h2" variant="by-heading-4" class="text-surface-text">
                    {{ title }}
                </Typography>
                <div class="flex inline">
                    <KTag v-if="isAnonymized" class="!bg-orange-600 mr-5"> anonymized </KTag>
                    <KTag v-if="isTransformed" class="!bg-orange-600 mr-5"> transformed </KTag>
                    <KTag class="hidden md:block">
                        {{ format }}
                    </KTag>
                </div>
            </div>

            <div class="my-0 flex flex-col lg:my-6 lg:flex-row lg:justify-between lg:gap-28">
                <div class="flex flex-1 flex-col gap-6">
                    <div class="markdown-content mt-4 text-sm leading-6 text-surface-light" v-html="description" />
                    <div class="flex">
                        <KTag class="md:hidden">
                            {{ format }}
                        </KTag>
                    </div>
                </div>

                <div class="my-12 lg:my-0 lg:basis-4/12 text-surface-text">
                    <DataToggler v-slot="{ truncated }" :data="resolvedData || []" :limit="1" :expanded="false">
                        <PropertyTable
                            :node="{
                                id: 'root',
                                label: '',
                                type: 'node',
                                isRoot: true,
                                data: truncated,
                            }"
                        />
                    </DataToggler>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div v-if="pistisMode == 'factory'" class="flex gap-6 flex-wrap">
                    <KButton size="small" @click="downloadFile">
                        {{ downloadText }}
                    </KButton>

                    <div v-if="catalog === 'my-data'" class="flex gap-6">
                        <a
                            :href="`${url}/srv/enrichment-ui/?datasetId=${props.datasetId}&distributionId=${props.distributionId}&file_type=${props.format}`"
                            target="_blank"
                            nofollow
                            noreferrer
                        >
                            <KButton size="small">
                                Data Enrichment
                                <!-- <i class="icon-[ph--arrow-square-out]" /> -->
                            </KButton>
                        </a>

                        <a
                            :href="`/anonymizer?datasetId=${props.datasetId}&distribution=${props.distributionId}&language=en`"
                            target="_blank"
                            nofollow
                            noreferrer
                        >
                            <KButton size="small">
                                Anonymize
                                <!-- <i class="icon-[ph--arrow-square-out]" /> -->
                            </KButton>
                        </a>
                    </div>
                    <!-- <KButton> Preview </KButton> -->

                    <LinkedDataSelector
                        :resource-id="distributionId"
                        resource="distributions"
                        class="text-white dark:text-surface-900 bg-pistis-600 dark:bg-primary-dark hover:bg-primary-hover dark:hover:bg-primary-dark-hover active:bg-primary dark:active:bg-primary-dark-pressed rounded-md border-transparent inline-flex min-w-fit items-center justify-center text-center font-medium align-bottom h-8 text-sm px-4 py-2"
                    />

                    <!-- Why is this not showing?? -->
                    <!-- <Dropdown severity="secondary" label="Beschreibung speichern">
                        <DropdownItem
                            v-for="[key, uri] in Object.entries(linkedData || {})"
                            :key="key"
                            as="a"
                            :href="uri"
                            target="_blank"
                        >
                            {{ key }}
                        </DropdownItem>
                    </Dropdown> -->

                    <!-- <button
                        class="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        @click="onSave"
                    >
                        {{ saveText }}
                    </button> -->
                </div>
            </div>
        </div>
    </div>
</template>
