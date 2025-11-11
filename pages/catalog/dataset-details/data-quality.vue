<!-- eslint-disable prettier/prettier -->
<template>
    <div class="text-gray-800">
        <!-- Main Content -->
        <main class="container mx-auto p-1">
            <div class="flex justify-between">
                <!-- Back Button -->
                <button class="-ml-6 mt-[10px] px-4 py-1 cursor-pointer" @click="router.back()">
                    <Typography
                        variant="paragraph-1"
                        class="flex items-center gap-2 text-primary hover:text-primary-hover"
                    >
                        <PhCaretLeft />
                        <span>back</span>
                    </Typography>
                </button>
            </div>
            <!-- Title Section -->
            <h3 class="mt-5 text-4xl text-primary-600 font-semibold">{{ title }}</h3>
            <h5 class="mb-5 text-lg">
                <span class="italic">by</span> <span class="font-semibold">{{ subtitle }}</span>
            </h5>

            <section class="mb-10">
                <h3 class="text-2xl font-semibold text-gray-700 mb-2">Metadata quality</h3>
                <p class="text-gray-600 mb-6">
                    The Metadata Quality Assurance is intended to help data providers and data portals to check their
                    metadata against various indicators.
                    <!-- For information on which metrics we use for indicator
                    measurements, please have a look at our
                    <a href="#" class="text-purple-600 hover:underline">methodology page</a>. -->
                </p>

                <!-- Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        v-for="card in relevantDatasetMetrics"
                        :key="card.title"
                        :class="` bg-gray-200 border border-gray-500 p-6 rounded-lg shadow-lg`"
                    >
                        <!-- :class="`${card.bg} ${card.text} p-6 rounded-lg shadow-lg`" -->
                        <h4 class="text-xl font-semibold text-pistis-700 mb-4">{{ card.title }}</h4>
                        <ul class="space-y-3 text-sm">
                            <li v-for="line in card.items" :key="line.title" class="flex justify-between items-center">
                                <span class="wrap-anywhere">{{ Object.keys(line)[0] }}</span>
                                <span class="metadata-value bg-pistis-300 font-bold">{{
                                    line[Object.keys(line)[0]]
                                }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Distribution Metadata Quality Section -->
            <section class="mb-10">
                <h3 class="text-2xl font-semibold text-gray-700 mb-2">Distribution Metadata Quality</h3>
                <p class="text-gray-600 mb-6">
                    The following lists the quality measurement of all distributions of the dataset.
                    <!-- For more information, see our
                    <NuxtLink to="/methodology" class="text-purple-600 hover:underline">methodology page</NuxtLink>. -->
                </p>

                <div class="space-y-4">
                    <!-- NUXT ACCORDIOUNS -->
                    <UAccordion :items="accordionItems" type="multiple">
                        <!-- Custom body for every accordion panel -->
                        <template #item="{ item }">
                            <div class="p-4 text-gray-700">
                                <div class="accordion-content p-3 text-sm text-gray-600">
                                    <div class="space-y-5">
                                        <div v-for="section in item.sections" :key="section.title">
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">
                                                {{ section.title }}
                                            </h5>
                                            <ul class="space-y-2 pl-2">
                                                <li
                                                    v-for="line in section.items"
                                                    :key="line.title"
                                                    class="flex justify-between items-center"
                                                >
                                                    <span>{{ line.title }}</span>
                                                    <span class="distribution-metadata-value font-bold">
                                                        {{ line.value }}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </UAccordion>
                </div>
            </section>

            <!-- Distribution Data Quality Section -->
            <section class="mb-10">
                <h3 class="text-2xl font-semibold text-gray-700 mb-2">Distribution Data Quality</h3>
                <p class="text-gray-600 mb-6">
                    The following lists the quality measurement of all distributions of the dataset.
                    <!-- For more information, see our
                    <NuxtLink to="/methodology" class="text-purple-600 hover:underline">methodology page</NuxtLink>. -->
                </p>

                <div class="space-y-4">
                    <!-- NUXT ACCORDIOUNS -->
                    <UAccordion :items="accordionItemsDataQuality" type="multiple">
                        <!-- Custom body for every accordion panel -->
                        <template #item="{ item }">
                            <div class="p-4 text-gray-700">
                                <div class="accordion-content p-3 text-sm text-gray-600">
                                    <div class="space-y-5">
                                        <div v-for="section in item.sections" :key="section.title">
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">
                                                {{ section.title }}
                                            </h5>
                                            <ul class="space-y-2 pl-2">
                                                <li
                                                    v-for="line in section.items"
                                                    :key="line.title"
                                                    class="flex flex-col"
                                                >
                                                    <div
                                                        class="flex justify-between items-center cursor-pointer"
                                                        @click="line.isGroup && (line.expanded = !line.expanded)"
                                                    >
                                                        <span class="flex items-center gap-1">
                                                            <span>{{ line.title }}</span>
                                                            <PhCaretDown
                                                                v-if="line.isGroup"
                                                                :class="[
                                                                    'transition-transform',
                                                                    line.expanded ? 'rotate-180' : '',
                                                                ]"
                                                            />
                                                        </span>
                                                        <span
                                                            v-if="!line.isGroup"
                                                            class="distribution-metadata-value font-bold"
                                                        >
                                                            {{ line.value }}
                                                        </span>
                                                    </div>

                                                    <!-- dropdown for column specific values -->
                                                    <ul
                                                        v-if="line.isGroup && line.expanded"
                                                        class="mt-2 ml-2 space-y-1"
                                                    >
                                                        <li
                                                            v-for="child in line.children"
                                                            :key="child.title"
                                                            class="flex justify-between items-center text-sm text-gray-600"
                                                        >
                                                            <div>
                                                                <span class="text-gray-400 font-semibold"
                                                                    >column name:</span
                                                                >
                                                                {{ child.title }}
                                                            </div>
                                                            <div class="flex gap-x-2">
                                                                <span class="text-gray-400 font-semibold"
                                                                    >column value:</span
                                                                >
                                                                <span class="distribution-metadata-value font-bold">
                                                                    {{ child.value }}
                                                                </span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </UAccordion>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import { useRoute, useRouter } from '#imports';
import {
    getDatasetMetrics,
    getDistributionsDataQualityMetrics,
    getDistributionsMetrics,
} from '~/components/catalog/dataset-details/DataQualityService';
import PhCaretDown from '~icons/ph/caret-down';
import PhCaretLeft from '~icons/ph/caret-left';

const router = useRouter();
const { datasetId, title, subtitle } = useRoute().query;

const datasetMetrics = ref({});
const relevantDatasetMetrics = ref([]);
const relevantDistributionsMetrics = ref([]);
const accordionItems = ref([]);
const accordionItemsDataQuality = ref([]);
const distributionsNames = ref([]);

/* helpers function */
const fmt = (v) => {
    if (Array.isArray(v)) {
        if (v.length === 0) return 'N/A';
        const yes = v.find((x) => x.name === 'yes');
        return yes?.percentage != null ? `${yes.percentage} %` : JSON.stringify(v);
    }
    if (typeof v === 'boolean') return v ? 'yes' : 'no';
    if (v && typeof v === 'object' && !Object.keys(v).length) return 'N/A';
    return v ?? 'N/A';
};

/* dataset metrics */
async function loadDatasetMetrics() {
    try {
        const raw = (await getDatasetMetrics(datasetId)).result.results[0];
        datasetMetrics.value = raw;

        const sec = (title, arr) => ({ title, items: arr });

        relevantDatasetMetrics.value = [
            sec('Accessibility', [
                { 'Download URL': fmt(raw.accessibility?.[0]?.downloadUrlAvailability) },
                { 'Most frequent accessing status codes': fmt(raw.accessibility?.[1]?.accessUrlStatusCode) },
                { 'Most frequent distribution status codes': fmt(raw.accessibility?.[2]?.downloadUrlStatusCode) },
            ]),
            sec('Findability', [
                { 'Keyword usage': fmt(raw.findability?.[0]?.keywordAvailability) },
                { Categories: fmt(raw.findability?.[1]?.categoryAvailability) },
                { 'Geo search': fmt(raw.findability?.[2]?.spatialAvailability) },
                { 'Time based search': fmt(raw.findability?.[3]?.temporalAvailability) },
            ]),
            sec('Reusability', [
                { 'Access restrictions': fmt(raw.reusability?.[0]?.accessRightsAvailability) },
                { 'License information': fmt(raw.reusability?.[1]?.licenceAvailability) },
                { 'Access restrictions vocabulary': fmt(raw.reusability?.[2]?.accessRightsVocabularyAlignment) },
                { 'Contact point': fmt(raw.reusability?.[3]?.contactPointAvailability) },
                { Publisher: fmt(raw.reusability?.[4]?.publisherAvailability) },
            ]),
            sec('Interoperability', [
                { 'DCAT-AP compliance': fmt(raw.interoperability?.[0]?.dcatApCompliance) },
                { Format: fmt(raw.interoperability?.[1]?.formatAvailability) },
                { 'Media type': fmt(raw.interoperability?.[2]?.mediaTypeAvailability) },
                {
                    'Format / Media type from Vocabulary': fmt(
                        raw.interoperability?.[3]?.formatMediaTypeVocabularyAlignment,
                    ),
                },
            ]),
            sec('Contextuality', [
                { 'File size': fmt(raw.contextuality?.[0]?.byteSizeAvailability) },
                { 'Rights Vocabulary': fmt(raw.contextuality?.[1]?.rightsAvailability) },
                { 'Spatial data of issue': fmt(raw.findability?.[2]?.spatialAvailability) },
                {
                    'Distribution Modification date': fmt(
                        raw.contextuality?.[3]?.distributions?.[0]?.dateModifiedAvailability,
                    ),
                },
                { 'Temporal data of issue': fmt(raw.contextuality?.[3]?.distributions?.[1]?.dateIssuedAvailability) },
            ]),
        ];
    } catch (e) {
        console.error('Loading dataset metrics failed:', e);
    }
}

/* distribution metrics */
async function loadDistributionsMetrics() {
    try {
        const distributions = (await getDistributionsMetrics(datasetId)).result.results.flat();
        relevantDistributionsMetrics.value = distributions;

        //relevant for data quality section to get titles for distributions
        distributionsNames.value = distributions.map((item) => ({
            id: item.info['distribution-id'],
            label: item.info['distribution-title'],
        }));

        accordionItems.value = distributions.map((d) => ({
            label: d.info?.['distribution-title'] || d.id?.['distribution-id'] || 'Unknown distribution',
            icon: 'i-lucide-box',
            sections: [
                {
                    title: 'Accessibility',
                    items: [
                        { title: 'Download URL', value: fmt(d.accessibility?.[0]?.downloadUrlAvailability) },
                        {
                            title: 'Most frequent accessURL status code',
                            value: fmt(d.accessibility?.[1]?.accessUrlStatusCode),
                        },
                        {
                            title: 'Most frequent downloadURL status code',
                            value: fmt(d.accessibility?.[2]?.downloadUrlStatusCode),
                        },
                    ],
                },
                {
                    title: 'Reusability',
                    items: [{ title: 'License information', value: fmt(d.reusability?.[0]?.licenceAvailability) }],
                },
                {
                    title: 'Contextuality',
                    items: [
                        { title: 'File size', value: fmt(d.contextuality?.[0]?.byteSizeAvailability) },
                        { title: 'Rights', value: fmt(d.contextuality?.[1]?.rightsAvailability) },
                        { title: 'Modification date', value: fmt(d.contextuality?.[2]?.dateModifiedAvailability) },
                        { title: 'Date of issue', value: fmt(d.contextuality?.[3]?.dateIssuedAvailability) },
                    ],
                },
                {
                    title: 'Interoperability',
                    items: [
                        { title: 'Format', value: fmt(d.interoperability?.[0]?.formatAvailability) },
                        { title: 'Media type', value: fmt(d.interoperability?.[1]?.mediaTypeAvailability) },
                        {
                            title: 'Format/Media type from vocabulary',
                            value: fmt(d.interoperability?.[2]?.formatMediaTypeVocabularyAlignment),
                        },
                    ],
                },
            ],
        }));
    } catch (e) {
        console.error('Loading distribution metrics failed:', e);
    }
}

async function loadDistributionsDataQualityMetrics() {
    try {
        const response = await getDistributionsDataQualityMetrics(datasetId);
        const distributions = response?.result?.distributions || [];

        console.log('>>>>>>>>>RESPONSE:', distributions);

        // all so far available metrics, may be expanded in the future:
        const metricStructure = {
            Accuracy: ['ExpectColumnValuesToBeBetween', 'ExpectColumnValuesToBeInSet'],
            Consistency: [
                'ExpectColumnMinToBeBetween',
                'ExpectColumnMaxToBeBetween',
                'ExpectColumnStdevToBeBetween',
                'ExpectColumnValueLengthsToEqual',
                'ExpectColumnValueLengthsToBeBetween',
            ],
            Completeness: ['ExpectColumnValuesToNotBeNull'],
            Uniqueness: ['NA'],
            Validity: [
                'ExpectColumnValuesToBeOfType',
                'ExpectTableColumnsToMatchOrderedList',
                'ExpectTableColumnsToMatchSet',
                'ExpectTableColumnCountToEqual',
                'ExpectTableRowCountToEqual',
            ],
        };

        const extractMetricName = (id) => {
            if (!id) return '';
            const parts = id.split('voc#');
            return parts.length > 1 ? parts[1] : id;
        };

        const extractColumnName = (m) => {
            const body = m?.quality_annotation?.body;
            if (!body) return 'Unknown column';

            const parsed = JSON.parse(body);
            return parsed?.column || 'Unknown column';
        };

        accordionItemsDataQuality.value = distributions.map((d) => {
            const measurements = d.measurements || [];

            const metricMap = {};
            for (const m of measurements) {
                const name = extractMetricName(m.metric?.id);
                if (!name) continue;
                if (!metricMap[name]) metricMap[name] = [];
                metricMap[name].push(m);
            }

            const sections = Object.entries(metricStructure)
                .map(([category, metricNames]) => {
                    const items = [];

                    for (const metricName of metricNames) {
                        const entries = metricMap[metricName] || [];
                        if (entries.length === 0) continue;

                        if (entries.length === 1) {
                            // metric appears only once for one distribution
                            const entry = entries[0];
                            items.push({
                                title: metricName,
                                value: fmt(entry.id),
                            });
                        } else {
                            // metric is column specific and appears mutliple times for one distribution
                            const children = entries
                                .map((entry) => ({
                                    title: extractColumnName(entry),
                                    value: fmt(entry.id),
                                }))
                                //sort columns
                                .sort((a, b) => {
                                    const aNum = parseInt(a.title);
                                    const bNum = parseInt(b.title);

                                    return aNum - bNum;
                                });

                            items.push({
                                title: `${metricName} (${entries.length})`,
                                isGroup: true,
                                children,
                            });
                        }
                    }

                    return items.length > 0 ? { title: category, items } : null;
                })
                .filter(Boolean);

            // get name for distribution based on distribution id
            const distributionLabel =
                distributionsNames.value.find((dn) => dn.id === d.id)?.label || d.id || 'Unknown distribution';

            return {
                label: distributionLabel,
                icon: 'i-lucide-box',
                sections,
            };
        });
    } catch (e) {
        console.error('Loading distribution metrics failed:', e);
    }
}

onMounted(async () => {
    await loadDistributionsMetrics();
    await loadDistributionsDataQualityMetrics();
    await loadDatasetMetrics();
});
</script>

<style scoped>
/* Metadata highlights */
.wrap-anywhere {
    overflow-wrap: anywhere;
}

.metadata-value {
    background-color: #c5c8ff;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #a2a4ff;
    min-width: 60px;
    text-align: center;
}
.metadata-value-yellow {
    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #374151;
}
.distribution-metadata-value {
    background-color: #c5c8ff;
    /* color: #5b21b6; */
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #a2a4ff;
    min-width: 50px;
    text-align: center;
    font-weight: 500;
}
</style>
