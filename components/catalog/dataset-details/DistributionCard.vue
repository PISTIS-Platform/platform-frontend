<script setup lang="ts">
import type { PropertyTableEntryNode } from '@piveau/sdk-vue';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useApiService } from '~/services/apiService';

const route = useRoute();

const pistisMode = route.query.pm;

const { getDatasetUrl } = useApiService(pistisMode);

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
    pistisSchema: object;
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

const showTable = ref(false);

const searchUrl = getDatasetUrl(props.datasetId);
const isTransformed = ref();
const isAnonymized = ref();
const isEncrypted = ref();
const hasPistisSchema = computed(() => !!props.pistisSchema);

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

            const fileName = `${downloadFileName}`;
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
        copyData.brokerUrl = response._data.bootstrapServers.trim().replace(/^https?:\/\//, '');
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
            class: 'text-white bg-primary-500 hover:bg-primary-600 justify-center font-medium',
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
            class: 'text-white bg-primary-500 hover:bg-primary-600 justify-center font-medium',
            click: () =>
                navigateTo(`/anonymizer?datasetId=${props.datasetId}&distribution=${props.distributionId}&language=en`),
        },
    ],
    [
        {
            label: 'Data Schema',
            class: 'text-white bg-primary-500 hover:bg-primary-600 justify-center font-medium',
            disabled: !hasPistisSchema.value,
            click: () => (showTable.value = !showTable.value),
        },
    ],
    [
        {
            label: 'GDPR Checker',
            class: 'text-white bg-primary-500 hover:bg-primary-600 justify-center font-medium',
            click: () => (gdprCheckerOpen.value = true),
        },
    ],
]);

const gdprCheckerOpen = ref(false);

const { mainQuestions, answerRef, questionKey, nextQuestion } = useGdprQuestions();
</script>

<template>
    <UModal v-model="gdprCheckerOpen">
        <div class="p-4 flex flex-col gap-4 text-neutral-600 h-[400px]">
            <span class="font-bold text-lg">GDPR Checker</span>
            <div class="flex flex-col gap-8 relative h-full">
                <span class="font-semibold">{{ mainQuestions[questionKey].question }}</span>
                <span class="italic text-sm">{{ mainQuestions[questionKey].description }}</span>
                <div class="flex items-start justify-between gap-4 w-full">
                    <URadioGroup v-model="answerRef" :options="mainQuestions[questionKey].answers" />
                    <UAlert
                        v-if="
                            answerRef &&
                            mainQuestions[questionKey]?.answers?.find((a: any) => a.value === answerRef).description
                        "
                        class="w-2/3"
                        color="blue"
                        variant="subtle"
                        :description="
                            mainQuestions[questionKey]?.answers?.find((a: any) => a.value === answerRef).description
                        "
                    />
                </div>
                <div class="w-full flex items-center justify-between absolute bottom-0">
                    <UButton color="red" variant="outline" class="" @click="answerRef = null">Cancel</UButton>
                    <UButton :disabled="!answerRef" class="" @click="nextQuestion()">Next</UButton>
                </div>
            </div>
        </div>
    </UModal>
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
                                >{{ copied && keyBeingCopied === 'topic' ? 'Copied' : '' }}
                            </UButton>
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
                                >{{ revealPassword ? 'Hide' : 'Reveal' }}
                            </UButton>
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
                    <UBadge color="secondary" variant="soft" size="xs" class="rounded-full">{{ format }}</UBadge>
                    <div>{{ title }}</div>
                </div>
                <div class="flex">
                    <div class="space-x-2 pr-5">
                        <UBadge v-if="isAnonymized" color="green" variant="soft" size="xs" class="rounded-full">
                            Anonymized</UBadge
                        >
                        <UBadge v-if="isTransformed" color="blue" variant="soft" size="xs" class="rounded-full">
                            Transformed</UBadge
                        >
                        <UBadge v-if="isEncrypted" color="yellow" variant="soft" size="xs" class="rounded-full">
                            Encrypted</UBadge
                        >
                    </div>

                    <div v-if="pistisMode == 'factory'" class="flex gap-x-3">
                        <UTooltip text="Download Distribution">
                            <UButton
                                variant="solid"
                                color="primary"
                                size="sm"
                                icon="i-heroicons-arrow-down-tray"
                                @click="downloadFile"
                            >
                                <span v-if="format === 'SQL'" class="text-xs opacity-60">(as CSV)</span>
                            </UButton>
                        </UTooltip>

                        <UButtonGroup v-if="!isStream">
                            <UDropdown :items="dropdownItems">
                                <UTooltip text="Show more">
                                    <UButton color="primary" variant="solid" icon="i-heroicons-ellipsis-horizontal" />
                                </UTooltip>
                            </UDropdown>
                        </UButtonGroup>
                    </div>
                </div>
            </div>
            <div v-if="pistisMode == 'factory' && showTable" class="flex flex-wrap pt-4 pb-5 pl-4">
                <UButton
                    variant="link"
                    color="gray"
                    trailing-icon="i-heroicons-x-mark"
                    class="text-base font-semibold text-gray-600 pb-2"
                    @click="showTable = !showTable"
                    >Data Schema
                </UButton>
                <PistisSchemaTable v-if="hasPistisSchema" :table-data="props.pistisSchema" />
            </div>
        </div>
    </div>
</template>
