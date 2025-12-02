<script setup lang="ts">
import type { PropertyTableEntryNode } from '@piveau/sdk-vue';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useApiService } from '~/services/apiService';
import PhCaretDown from '~icons/ph/caret-down';

const route = useRoute();

const pistisMode = route.query.pm;

const { getDistributionsUrl, getDatasetUrl } = useApiService(pistisMode);

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

const catalog = ref(null);

const showBtns = ref(false);

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

const fileExtension = computed(() => {
    if (props.format === 'Excel XLS') return 'xls';
    if (props.format === 'Excel XLSX') return 'xlsx';

    return props.format.toLowerCase();
});
const isEnrichmentDisabled = computed(() => ['pdf', 'xml'].includes(fileExtension.value));

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

            if (props.format === 'SQL') {
                config.params = { JSON_output: 'False' };
            }

            const response = await axios.get(accessUrl, config);

            const contentTypeHeader = response.headers['content-type'];
            const contentType = contentTypeHeader.split(';')[0].trim();

            const fileExtensionDownload = props.format === 'SQL' ? 'csv' : props.format.toLowerCase();
            const fileName =
                props.format === 'Excel XLS' || props.format === 'Excel XLSX'
                    ? `${downloadFileName}.${fileExtension.value}`
                    : `${downloadFileName}.${fileExtensionDownload}`;
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

const openMetadata = () => {
    const distributionsUrl = getDistributionsUrl();
    window.open(`${distributionsUrl}${props.distributionId}.ttl`);
};

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

const dropdownItems = computed(() => [
    [
        {
            label: 'Data Enrichment',
            class: 'text-secondary-500 bg-secondary-50 hover:bg-secondary-100 justify-center font-medium',
            disabled: isEnrichmentDisabled.value,
            click: () => {
                if (!isEnrichmentDisabled.value) {
                    navigateTo(
                        `/catalog/dataset-details/data-enrichment?datasetId=${props.datasetId}&distributionId=${props.distributionId}&file_type=${fileExtension.value}`,
                    );
                }
            },
        },
    ],
    [
        {
            label: 'Anonymize',
            class: 'text-secondary-500 bg-secondary-50 hover:bg-secondary-100 justify-center font-medium',
            click: () =>
                navigateTo(`/anonymizer?datasetId=${props.datasetId}&distribution=${props.distributionId}&language=en`),
        },
    ],
]);
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
        <div>
            <div class="flex justify-between">
                <div class="flex items-center font-semibold text-neutral-500 space-x-2 pr-5">
                    <UBadge color="secondary" variant="soft" size="xs">{{ format }}</UBadge>
                    <div>{{ title }}</div>
                </div>
                <div class="flex">
                    <div class="space-x-2 pr-5">
                        <UBadge v-if="isAnonymized" color="green" variant="soft" size="xs">Anonymized</UBadge>
                        <UBadge v-if="isTransformed" color="blue" variant="soft" size="xs">Transformed</UBadge>
                        <UBadge v-if="isEncrypted" color="yellow" variant="soft" size="xs">Encrypted</UBadge>
                    </div>

                    <div v-if="pistisMode == 'factory'">
                        <UButtonGroup v-if="catalog === 'my-data' && !isStream">
                            <UButton
                                variant="soft"
                                color="secondary"
                                size="sm"
                                icon="i-heroicons-arrow-down-tray"
                                @click="downloadFile"
                            >
                                {{ downloadText }}
                                <span v-if="format === 'SQL'" class="text-xs opacity-60">(as CSV)</span>
                            </UButton>

                            <UDropdown :items="dropdownItems">
                                <UButton color="secondary" variant="link" icon="i-lucide-chevron-down" />
                            </UDropdown>
                        </UButtonGroup>
                        <UButton
                            v-else
                            variant="soft"
                            color="secondary"
                            size="sm"
                            icon="i-heroicons-arrow-down-tray"
                            @click="downloadFile"
                        >
                            {{ downloadText }} <span v-if="format === 'SQL'" class="text-xs opacity-60">(as CSV)</span>
                        </UButton>
                    </div>
                    <button v-if="pistisMode == 'factory'" class="ml-10" @click="showBtns = !showBtns">
                        <PhCaretDown
                            :class="{
                                'rotate-180': showBtns,
                            }"
                        />
                    </button>
                </div>
            </div>
            <div v-if="pistisMode == 'factory' && showBtns" class="flex flex-wrap gap-6 pt-4 pb-5 pl-4">
                <UButton
                    v-if="format === 'SQL'"
                    variant="soft"
                    color="secondary"
                    size="sm"
                    icon="i-heroicons-arrow-top-right-on-square"
                    @click="openMetadata"
                    >See Data Schema</UButton
                >
            </div>
        </div>
    </div>
</template>
