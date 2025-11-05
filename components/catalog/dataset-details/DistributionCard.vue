<script setup lang="ts">
import type { PropertyTableEntryNode } from '@piveau/sdk-vue';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useApiService } from '~/services/apiService';

import { PropertyTable } from './PropertyTableRow';

const route = useRoute();

const pistisMode = route.query.pm;

const { getDatasetUrl, getEnrichmentUrl } = useApiService(pistisMode);

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

const searchUrl = getDatasetUrl(props.datasetId);
const isTransformed = ref();
const isAnonymized = ref();
const isEncrypted = ref();

const isStream = computed(() => props.title.toLowerCase() === 'kafka stream' && props.format.toLowerCase() === 'csv');

const fetchMetadata = async () => {
    try {
        const response = await fetch(searchUrl);
        const data = await response.json();
        copyData.topic = `ds-${data.result.id}`;
        catalog.value = data.result.catalog.id;
        isTransformed.value = data.result.distributions.some((transformation) => transformation?.is_transformed);
        isAnonymized.value = data.result.distributions.some((anonymization) => anonymization?.is_anonymized);
        isEncrypted.value = data.result.distributions.some((encryption) => encryption?.is_encrypted);
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
            downloadFileName = titleObject;
        }
    }
}

async function downloadFile() {
    const accessUrl = props.downloadUrl;
    if (props.title === 'Kafka Stream') {
        streamIsOpen.value = true;
    } else {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'blob',
            };

            let fileExtension = props.format.toLowerCase();
            if (props.format === 'SQL') {
                fileExtension = 'csv';
                config.params = { JSON_output: 'False' };
            }

            const response = await axios.get(accessUrl, config);

            const contentTypeHeader = response.headers['content-type'];
            const contentType = contentTypeHeader.split(';')[0].trim();

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
}
const { data: streamingConsumerData } = useFetch<{
    username: string;
    password: string;
    bootstrapServers: string;
    securityProtocol: string;
    saslMechanism: string;
}>(`/api/account/get-kafka-details`, {
    onResponse({ response }) {
        copyData.brokerUrl = response._data.bootstrapServers;
        copyData.username = response._data.username;
        copyData.password = response._data.password;
        copyData.securityProtocol = response._data.securityProtocol;
        copyData.saslMechanism = response._data.saslMechanism;
    },
});

const streamIsOpen = ref(false);

const copyData = reactive<Record<string, string>>({
    brokerUrl: '',
    topic: '',
    username: '',
    password: '',
    securityProtocol: '',
    saslMechanism: '',
});

let timeout: ReturnType<typeof setTimeout>;
const { copy, copied } = useClipboard();
const keyBeingCopied = ref('');

const copyItem = (key: string) => {
    clearTimeout(timeout);

    keyBeingCopied.value = key;
    copy(copyData[key] || '');

    timeout = setTimeout(() => {
        keyBeingCopied.value = '';
    }, 2000);
};

const revealPassword = ref(false);
</script>

<template>
    <UModal v-model="streamIsOpen">
        <div class="w-full h-full flex flex-col justify-center p-6 text-gray-700">
            <h2 class="font-bold text-lg">{{ $t('data.streaming.details') }}</h2>
            <p class="mt-2 text-wrap">{{ $t('data.streaming.downloadText') }}</p>
            <div v-if="streamingConsumerData" class="flex flex-wrap sm:flex-nowrap gap-8 mt-6 w-full">
                <div class="flex flex-col">
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{ $t('data.streaming.brokerUrl') }}</span>
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ copyData.brokerUrl }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem('brokerUrl')"
                                >{{ copied && keyBeingCopied === 'brokerUrl' ? 'Copied' : '' }}</UButton
                            >
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 mt-6">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{ $t('data.streaming.topic') }}</span>
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ copyData.topic }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem('topic')"
                                >{{ copied && keyBeingCopied === 'topic' ? 'Copied' : '' }}</UButton
                            >
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 mt-6">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{
                                $t('settings.streamingConsumerUsername')
                            }}</span>
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ copyData.username }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem('username')"
                                >{{ copied && keyBeingCopied === 'username' ? 'Copied' : '' }}</UButton
                            >
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 mt-6">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{
                                $t('settings.streamingConsumerPassword')
                            }}</span>
                            <UButton
                                class="flex items-center justify-center w-16"
                                size="xs"
                                @click="revealPassword = !revealPassword"
                                >{{ revealPassword ? 'Hide' : 'Reveal' }}</UButton
                            >
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ revealPassword ? copyData.password : '*********' }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem('password')"
                                >{{ copied && keyBeingCopied === 'password' ? 'Copied' : '' }}</UButton
                            >
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 mt-6">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{ $t('settings.securityProtocol') }}</span>
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ copyData.securityProtocol }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem('securityProtocol')"
                                >{{ copied && keyBeingCopied === 'securityProtocol' ? 'Copied' : '' }}</UButton
                            >
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 mt-6">
                        <div class="flex items-center justify-between flex-wrap gap-2 w-[320px]">
                            <span class="font-semibold text-gray-500">{{ $t('settings.saslMechanism') }}</span>
                        </div>
                        <span class="font-mono flex items-center"
                            >{{ copyData.saslMechanism }}
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="sm"
                                variant="ghost"
                                square
                                @click="copyItem('saslMechanism')"
                                >{{ copied && keyBeingCopied === 'saslMechanism' ? 'Copied' : '' }}</UButton
                            >
                        </span>
                    </div>
                </div>

                <div class="w-0 sm:w-1/2"></div>
            </div>
        </div>
    </UModal>
    <div class="flex flex-col pb-4">
        <div class="flex flex-row justify-between items-center">
            <div class="flex">
                <div class="flex items-center font-semibold text-neutral-500 space-x-2 pr-5">
                    <UBadge color="secondary" variant="outline">{{ format }}</UBadge>
                    <div>{{ title }}</div>
                </div>
                <div class="space-x-2">
                    <UBadge v-if="isAnonymized" color="green" variant="subtle">Anonymized</UBadge>
                    <UBadge v-if="isTransformed" color="blue" variant="subtle">Transformed</UBadge>
                    <UBadge v-if="isEncrypted" color="yellow" variant="subtle">Encrypted</UBadge>
                </div>
            </div>
            <div v-if="pistisMode == 'factory'" class="flex flex-wrap gap-6">
                <UButton
                    variant="soft"
                    color="secondary"
                    size="sm"
                    icon="i-heroicons-arrow-down-tray"
                    @click="downloadFile"
                >
                    {{ downloadText }} <span v-if="format === 'SQL'" class="text-xs opacity-60">(as CSV)</span>
                </UButton>
                <div v-if="catalog === 'my-data' && !isStream" class="flex gap-6">
                    <!-- <a
                        :href="getEnrichmentUrl(props.datasetId, props.distributionId, props.format)"
                        target="_blank"
                        nofollow
                        noreferrer
                    > -->
                    <!-- <UButton
                        v-if="pistisMode === 'factory'"
                        size="sm"
                        label="Data Enrichment"
                        :to="{
                            path: '/catalog/dataset-details/data-enrichment',
                            query: {
                                datasetId: props.datasetId,
                                distributionId: props.distributionId,
                                file_type: props.format,
                            },
                        }"
                        prefetch="false"
                    /> -->
                    <a
                        :href="`/catalog/dataset-details/data-enrichment?datasetId=${props.datasetId}&distributionId=${props.distributionId}&file_type=${props.format}`"
                        class="inline-block bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer text-center"
                    >
                        Data Enrichment
                    </a>
                    <!-- </a> -->

                    <UButton
                        size="sm"
                        variant="soft"
                        :label="$t('buttons.anonymize')"
                        :to="`/anonymizer?datasetId=${props.datasetId}&distribution=${props.distributionId}&language=en`"
                    />
                </div>
            </div>
        </div>
    </div>

    <div v-if="false" class="mb-3 rounded-lg border-b-none bg-white ring-1 ring-gray-200 shadow p-4">
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
                            :href="getEnrichmentUrl(props.datasetId, props.distributionId, props.format)"
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

                    <!-- <LinkedDataSelector
                        :resource-id="distributionId"
                        resource="distributions"
                        class="text-white dark:text-surface-900 bg-pistis-600 dark:bg-primary-dark hover:bg-primary-hover dark:hover:bg-primary-dark-hover active:bg-primary dark:active:bg-primary-dark-pressed rounded-md border-transparent inline-flex min-w-fit items-center justify-center text-center font-medium align-bottom h-8 text-sm px-4 py-2"
                    /> -->

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
